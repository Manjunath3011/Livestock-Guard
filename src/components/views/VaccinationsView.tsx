import React, { useState } from 'react';
import { VaccinationRecord, Animal, User } from '../../types';
import { VACCINES_LIST } from '../../data/knowledgeBase';
import { store } from '../../services/store';
import { Modal } from '../common/Modal';
import { Syringe, PlusCircle, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VaccinationsViewProps {
  vaccinations: VaccinationRecord[];
  animals: Animal[];
  currentUser: User;
}

export const VaccinationsView: React.FC<VaccinationsViewProps> = ({
  vaccinations,
  animals,
  currentUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>(VACCINES_LIST[0]?.id || 'vac_fmd');
  const [batchNumber, setBatchNumber] = useState('IVRI-FMD-2026-B88');
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedVaccine = VACCINES_LIST.find(v => v.id === selectedVaccineId) || VACCINES_LIST[0];
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  const handleLogVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    const boosterMonths = selectedVaccine.boosterFrequencyMonths || 12;
    const nextDue = new Date(Date.now() + boosterMonths * 30 * 86400000)
      .toISOString()
      .split('T')[0];

    store.createVaccinationRecord({
      animalId: selectedAnimal.id,
      animalTag: selectedAnimal.tagNumber,
      species: selectedAnimal.species,
      farmId: selectedAnimal.farmId,
      villageName: 'Malegaon Budruk',
      districtName: 'Pune',
      vaccineId: selectedVaccine.id,
      vaccineName: selectedVaccine.name,
      diseasePrevented: selectedVaccine.diseasePrevented,
      dateAdministered: administeredDate,
      nextDueDate: nextDue,
      doseNumber: 1,
      batchNumber,
      administeredBy: currentUser.name,
      administeredByRole: currentUser.role
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
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Syringe className="w-4 h-4" />
            National Livestock Immunization Registry
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Vaccinations ({vaccinations.length} Logged Doses)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track batch numbers, booster schedules, cold-chain compliance and ring immunization logs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-700/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Log Vaccination Dose
        </button>
      </div>

      {/* Vaccines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Animal Ear Tag</th>
                <th className="px-4 py-3.5">Target Disease</th>
                <th className="px-4 py-3.5">Vaccine Product / Batch</th>
                <th className="px-4 py-3.5">Administered Date</th>
                <th className="px-4 py-3.5">Next Booster Due</th>
                <th className="px-4 py-3.5">Vaccinator</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vaccinations.map(vac => (
                <tr key={vac.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {vac.animalTag}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-900">
                    {vac.diseasePrevented}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{vac.vaccineName}</span>
                    <span className="text-slate-400 block text-[10px] font-mono">Batch: {vac.batchNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {vac.dateAdministered}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {vac.nextDueDate}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                    {vac.administeredBy} ({vac.administeredByRole})
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      vac.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {vac.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Vaccine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Administer Livestock Vaccine"
        subtitle="Record individual vaccination certificate with cold-chain batch validation."
        maxWidth="lg"
      >
        <form onSubmit={handleLogVaccine} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Animal Ear Tag *</label>
              <select
                value={selectedAnimalId}
                onChange={e => setSelectedAnimalId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              >
                {animals.map(a => (
                  <option key={a.id} value={a.id}>
                    Tag {a.tagNumber} ({a.species} - {a.ownerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine Formula *</label>
              <select
                value={selectedVaccineId}
                onChange={e => setSelectedVaccineId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              >
                {VACCINES_LIST.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.diseasePrevented})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine Batch / Lot Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Administered *</label>
              <input
                type="date"
                required
                value={administeredDate}
                onChange={e => setAdministeredDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              />
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Save Vaccination Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
