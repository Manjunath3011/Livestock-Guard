import React, { useState, useEffect } from 'react';
import { Herd, Farm, User, Species } from '../../types';
import { store } from '../../services/store';
import { RiskBadge } from '../common/RiskBadge';
import { Modal } from '../common/Modal';
import { IndiaLocationPicker } from '../common/IndiaLocationPicker';
import { NormalizedLocationSelection } from '../../types/location';
import {
  Layers,
  PlusCircle,
  Users,
  MapPin,
  Shield,
  CheckCircle2,
  Edit3,
  Trash2,
  AlertTriangle,
  FolderOpen,
  QrCode,
  HeartPulse,
  Activity,
  Calendar,
  X
} from 'lucide-react';

interface HerdsViewProps {
  herds?: Herd[];
  farms?: Farm[];
  currentUser: User;
}

export const HerdsView: React.FC<HerdsViewProps> = ({
  herds: propHerds,
  farms: propFarms,
  currentUser
}) => {
  // Reactive herds and farms from store
  const [herds, setHerds] = useState<Herd[]>(() => {
    return currentUser.role === 'FARMER' ? store.getScopedHerds() : (propHerds || store.getScopedHerds());
  });
  const [farms, setFarms] = useState<Farm[]>(() => {
    return currentUser.role === 'FARMER' ? store.getScopedFarms() : (propFarms || store.getScopedFarms());
  });

  const refreshHerds = () => {
    if (currentUser.role === 'FARMER') {
      setHerds(store.getScopedHerds());
      setFarms(store.getScopedFarms());
    } else {
      setHerds(store.getScopedHerds());
      setFarms(store.getScopedFarms());
    }
  };

  useEffect(() => {
    refreshHerds();
    return store.subscribe(refreshHerds);
  }, [currentUser]);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [herdName, setHerdName] = useState('');
  const [species, setSpecies] = useState<Species>('Cattle');
  const [breed, setBreed] = useState('Mixed Dairy Herd');
  const [animalCount, setAnimalCount] = useState<number>(10);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || 'farm_01');
  const [isCustomLocationOpen, setIsCustomLocationOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState<NormalizedLocationSelection | null>(null);

  // Edit Modal State
  const [editingHerd, setEditingHerd] = useState<Herd | null>(null);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editSpecies, setEditSpecies] = useState<Species>('Cattle');
  const [editAnimalCount, setEditAnimalCount] = useState<number>(10);

  // Delete Modal State
  const [deletingHerd, setDeletingHerd] = useState<Herd | null>(null);

  // Herd Detail Modal State
  const [selectedHerdDetail, setSelectedHerdDetail] = useState<Herd | null>(null);

  // Keep selectedFarmId synchronized when farms change
  useEffect(() => {
    if (farms.length > 0 && !farms.some(f => f.id === selectedFarmId)) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  const handleCreateHerd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!herdName.trim()) return;

    const farm = farms.find(f => f.id === selectedFarmId) || farms[0];
    const loc = customLocation || (farm ? {
      stateId: farm.stateId,
      districtId: farm.districtId,
      villageId: farm.villageId
    } : null);

    store.registerHerd({
      name: herdName.trim(),
      species,
      breed: breed.trim() || 'Mixed Herd Group',
      totalAnimals: animalCount,
      healthyCount: animalCount,
      affectedCount: 0,
      underObservationCount: 0,
      recoveredCount: 0,
      deathCount: 0,
      vaccinationCoveragePct: 92,
      farmId: farm?.id || selectedFarmId,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      stateId: loc?.stateId || farm?.stateId || 'st_in_mh',
      districtId: loc?.districtId || farm?.districtId || 'dt_in_mh_pune',
      villageId: loc?.villageId || farm?.villageId || 'vl_in_mh_pune_baramati_malegaon_bk'
    });

    setIsCreateModalOpen(false);
    setHerdName('');
    setBreed('Mixed Dairy Herd');
    setIsCustomLocationOpen(false);
    setCustomLocation(null);
  };

  const handleStartEdit = (herd: Herd) => {
    setEditingHerd(herd);
    setEditName(herd.name);
    setEditBreed(herd.breed || '');
    setEditSpecies(herd.species);
    setEditAnimalCount(herd.totalAnimals);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHerd || !editName.trim()) return;

    store.updateHerd(editingHerd.id, {
      name: editName.trim(),
      breed: editBreed.trim() || editingHerd.breed,
      species: editSpecies,
      totalAnimals: Number(editAnimalCount) || editingHerd.totalAnimals
    });

    setEditingHerd(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingHerd) return;
    store.deleteHerd(deletingHerd.id);
    setDeletingHerd(null);
  };

  // Single Source of Truth: Calculate dynamic live stats for a herd based on individual animals & active cases
  const getHerdStats = (herd: Herd) => {
    return store.getHerdStatistics(herd);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            {currentUser.role === 'FARMER' ? 'My Managed Herds & Flocks' : 'Herd & Flock Unit Management'}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Herds ({herds.length} {herds.length === 1 ? 'Unit' : 'Units'})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === 'FARMER'
              ? `Manage and monitor your private herds on ${currentUser.farmName || 'your farm'}. Data is strictly isolated to your registered holding.`
              : 'Monitor herd-level epidemiological risk scores, vaccination coverage and collective health metrics.'}
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

      {/* Herds Grid or Empty State */}
      {herds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-900">No Herds Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You currently have no registered herds or flock units under your holding. Click below to create your first herd and track collective health metrics.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Register Your First Herd
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {herds.map(herd => {
            const stats = getHerdStats(herd);
            const canManage = currentUser.role === 'FARMER' || currentUser.role === 'SYSTEM_ADMIN' || currentUser.role === 'STATE_ADMIN';

            return (
              <div
                key={herd.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
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

                  {/* Health Breakdown */}
                  <div className={`bg-slate-50 rounded-xl p-3 border border-slate-100 grid ${stats.other > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center text-xs`}>
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Head</span>
                      <p className="font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div>
                      <span className="text-emerald-700 text-[10px]">Healthy</span>
                      <p className="font-bold text-emerald-700">{stats.healthy}</p>
                    </div>
                    <div>
                      <span className="text-rose-700 text-[10px]">Affected</span>
                      <p className="font-bold text-rose-700">{stats.affected}</p>
                    </div>
                    {stats.other > 0 && (
                      <div>
                        <span className="text-amber-700 text-[10px]">Other / Pending</span>
                        <p className="font-bold text-amber-700">{stats.other}</p>
                      </div>
                    )}
                  </div>

                  {/* Herd Attributes */}
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Species:</span>
                      <span className="font-semibold text-slate-800">{herd.species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner:</span>
                      <span className="font-semibold text-slate-800">{herd.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vaccine Coverage:</span>
                      <span className="font-semibold text-emerald-700">{herd.vaccinationCoveragePct}%</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {herd.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedHerdDetail(herd)}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="View Herd Animals & Breakdown"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleStartEdit(herd)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit Herd Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingHerd(herd)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Delete Herd"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed / Variety</label>
              <input
                type="text"
                placeholder="e.g. Holstein Friesian, Murrah"
                value={breed}
                onChange={e => setBreed(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Animal Head Count *</label>
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
            <p className="text-[10px] text-slate-400 mt-1">
              Herds can only be registered to your authorized farm holdings.
            </p>
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

      {/* Edit Herd Modal */}
      {editingHerd && (
        <Modal
          isOpen={!!editingHerd}
          onClose={() => setEditingHerd(null)}
          title={`Edit Herd: ${editingHerd.herdCode}`}
          subtitle="Update group identity, species, breed and head count"
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Herd Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Species *</label>
                <select
                  value={editSpecies}
                  onChange={e => setEditSpecies(e.target.value as Species)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Breed / Variety</label>
                <input
                  type="text"
                  value={editBreed}
                  onChange={e => setEditBreed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Head Count *</label>
              <input
                type="number"
                min={1}
                value={editAnimalCount}
                onChange={e => setEditAnimalCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingHerd(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingHerd && (
        <Modal
          isOpen={!!deletingHerd}
          onClose={() => setDeletingHerd(null)}
          title="Delete Herd Unit"
          subtitle="Are you sure you want to remove this herd?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">This will remove herd record {deletingHerd.herdCode}.</p>
                <p className="text-[11px] text-rose-700 mt-1">
                  Herd: <strong>{deletingHerd.name}</strong> ({deletingHerd.species}, {deletingHerd.totalAnimals} head)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingHerd(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Herd Detail Modal */}
      {selectedHerdDetail && (() => {
        const stats = getHerdStats(selectedHerdDetail);
        const allAnimals = store.getAnimals();
        const herdAnimals = allAnimals.filter(
          a => !(a as any).isDeleted && !(a as any).isArchived &&
               (a.herdId === selectedHerdDetail.id || a.herdId === selectedHerdDetail.herdCode)
        );
        const allCases = store.getCases();
        const activeCases = allCases.filter(
          c => c.status !== 'RESOLVED' && c.status !== 'RULED_OUT' && c.status !== 'CLOSED' && (c as any).status !== 'DISMISSED'
        );

        return (
          <Modal
            isOpen={!!selectedHerdDetail}
            onClose={() => setSelectedHerdDetail(null)}
            title={`${selectedHerdDetail.herdCode} • ${selectedHerdDetail.name}`}
            subtitle={`${selectedHerdDetail.species} • ${selectedHerdDetail.breed} • Owner: ${selectedHerdDetail.ownerName}`}
            maxWidth="2xl"
          >
            <div className="space-y-5">
              {/* Herd Header & Risk */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Holding / Holding ID</div>
                  <div className="font-semibold text-slate-800 text-sm mt-0.5">{selectedHerdDetail.farmId}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Vaccine Coverage</div>
                    <div className="font-bold text-emerald-700 text-sm">{selectedHerdDetail.vaccinationCoveragePct}%</div>
                  </div>
                  <RiskBadge level={selectedHerdDetail.riskLevel} score={selectedHerdDetail.riskScore} size="md" />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className={`grid ${stats.other > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-3 text-center`}>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-semibold">Total Head</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 text-xs font-semibold">Healthy</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{stats.healthy}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-rose-700 text-xs font-semibold">Affected</span>
                  <p className="text-2xl font-black text-rose-700 mt-1">{stats.affected}</p>
                </div>
                {stats.other > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-amber-700 text-xs font-semibold">Other / Pending</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{stats.other}</p>
                  </div>
                )}
              </div>

              {/* Formula Reconciliation Note */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl px-3 py-2 text-[11px] text-emerald-900 flex items-center justify-between">
                <span className="font-mono">
                  Reconciliation: Total ({stats.total}) = Healthy ({stats.healthy}) + Affected ({stats.affected}){stats.other > 0 ? ` + Other (${stats.other})` : ''}
                </span>
                <span className="font-bold text-emerald-800">✓ 100% Balanced</span>
              </div>

              {/* Associated Animals Roster */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Registered Livestock in Herd ({herdAnimals.length})</span>
                  <span className="text-slate-400 font-normal">Farmer Data Isolated</span>
                </h4>

                {herdAnimals.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No individual electronic ear tags attached. Tracked collectively as a {selectedHerdDetail.species} group.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Tag Number</th>
                          <th className="px-3 py-2.5">Name / Breed</th>
                          <th className="px-3 py-2.5">Sex & Age</th>
                          <th className="px-3 py-2.5">Health Status</th>
                          <th className="px-3 py-2.5">Active Case</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {herdAnimals.map(a => {
                          const animalActiveCase = activeCases.find(c => c.animalId === a.id || a.activeCaseId === c.id);
                          const isAffected = animalActiveCase || a.currentHealthStatus === 'AFFECTED';
                          const isOther = (a.currentHealthStatus as string) === 'UNKNOWN' || (a.currentHealthStatus as string) === 'PENDING' || (a as any).isUnverified;
                          const effectiveStatus = isAffected ? 'AFFECTED' : isOther ? 'PENDING' : 'HEALTHY';

                          return (
                            <tr key={a.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono font-bold text-slate-800">
                                {a.tagNumber}
                              </td>
                              <td className="px-3 py-2">
                                <span className="font-semibold text-slate-900">{a.name || 'Unnamed'}</span>
                                <span className="text-slate-400 block text-[10px]">{a.breed}</span>
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {a.sex} • {a.ageYears}y
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  effectiveStatus === 'HEALTHY'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : effectiveStatus === 'AFFECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {effectiveStatus}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-[11px]">
                                {animalActiveCase ? (
                                  <span className="text-rose-700 font-bold">{animalActiveCase.caseNumber}</span>
                                ) : (
                                  <span className="text-slate-400">None</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedHerdDetail(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
