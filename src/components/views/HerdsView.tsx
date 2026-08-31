import React, { useState } from 'react';
import { Herd, Farm, User, Species } from '../../types';
import { store } from '../../services/store';
import { RiskBadge } from '../common/RiskBadge';
import { Modal } from '../common/Modal';
import { IndiaLocationPicker } from '../common/IndiaLocationPicker';
import { NormalizedLocationSelection } from '../../types/location';
import { Layers, PlusCircle, Users, MapPin, Shield, CheckCircle2, Edit3 } from 'lucide-react';

interface HerdsViewProps {
  herds: Herd[];
  farms: Farm[];
  currentUser: User;
}

export const HerdsView: React.FC<HerdsViewProps> = ({ herds, farms, currentUser }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [herdName, setHerdName] = useState('');
  const [species, setSpecies] = useState<Species>('Cattle');
  const [animalCount, setAnimalCount] = useState<number>(25);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || 'farm_01');
  const [isCustomLocationOpen, setIsCustomLocationOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState<NormalizedLocationSelection | null>(null);

  const handleCreateHerd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!herdName.trim()) return;

    const farm = farms.find(f => f.id === selectedFarmId);
    const loc = customLocation || (farm ? {
      stateId: farm.stateId,
      districtId: farm.districtId,
      villageId: farm.villageId
    } : null);

    store.registerHerd({
      name: herdName.trim(),
      species,
      breed: 'Mixed Herd Group',
      totalAnimals: animalCount,
      healthyCount: animalCount,
      affectedCount: 0,
      underObservationCount: 0,
      recoveredCount: 0,
      deathCount: 0,
      vaccinationCoveragePct: 90,
      farmId: selectedFarmId,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      stateId: loc?.stateId || farm?.stateId || 'st_in_mh',
      districtId: loc?.districtId || farm?.districtId || 'dt_in_mh_pune',
      villageId: loc?.villageId || farm?.villageId || 'vl_in_mh_pune_baramati_malegaon_bk'
    });

    setIsCreateModalOpen(false);
    setHerdName('');
    setIsCustomLocationOpen(false);
    setCustomLocation(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Herd & Flock Unit Management
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Herds ({(herds || []).length} Managed Units)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor herd-level epidemiological risk scores, vaccination coverage and collective health metrics.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Herd
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {herds.map(herd => (
          <div
            key={herd.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                  {herd.herdCode}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{herd.name}</h3>
                <p className="text-xs text-slate-500">{herd.breed}</p>
              </div>
              <RiskBadge level={herd.riskLevel} score={herd.riskScore} size="sm" />
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Total Head</span>
                <p className="font-bold text-slate-900">{herd.totalAnimals}</p>
              </div>
              <div>
                <span className="text-emerald-700 text-[10px]">Healthy</span>
                <p className="font-bold text-emerald-700">{herd.healthyCount}</p>
              </div>
              <div>
                <span className="text-rose-700 text-[10px]">Affected</span>
                <p className="font-bold text-rose-700">{herd.affectedCount}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Species:</span>
                <span className="font-semibold text-slate-800">{herd.species}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="font-semibold text-slate-800">{herd.ownerName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Herd Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Livestock Herd / Flock"
        subtitle="Group livestock for mass vaccination campaigns and collective surveillance."
        maxWidth="md"
      >
        <form onSubmit={handleCreateHerd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Herd Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit A High-Yielding Dairy"
              value={herdName}
              onChange={e => setHerdName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Species *</label>
            <select
              value={species}
              onChange={e => setSpecies(e.target.value as Species)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="Cattle">Cattle</option>
              <option value="Buffalo">Buffalo</option>
              <option value="Goat">Goat</option>
              <option value="Sheep">Sheep</option>
              <option value="Pig">Pig</option>
              <option value="Poultry">Poultry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Animal Count *</label>
            <input
              type="number"
              min={1}
              value={animalCount}
              onChange={e => setAnimalCount(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Holding Unit *</label>
            <select
              value={selectedFarmId}
              onChange={e => {
                setSelectedFarmId(e.target.value);
                setCustomLocation(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.villageName || f.villageId}, {f.districtName || f.districtId})
                </option>
              ))}
            </select>
          </div>

          {/* Location Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Herd Location
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomLocationOpen(!isCustomLocationOpen)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                {isCustomLocationOpen ? 'Use Farm Location' : 'Change Location'}
              </button>
            </div>

            {!isCustomLocationOpen ? (
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Inherited from Farm:</span>
                  <span className="font-bold text-slate-900">
                    {(() => {
                      const f = farms.find(farm => farm.id === selectedFarmId);
                      return f ? `${f.villageName || f.villageId}, ${f.districtName || f.districtId}, ${f.stateName || 'Maharashtra'}` : 'Location inherited from farm';
                    })()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Farm Locked
                </span>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200">
                <IndiaLocationPicker
                  value={customLocation}
                  onChange={setCustomLocation}
                  mode="FULL"
                  title="Select Custom State, District & Village"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Create Herd
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
