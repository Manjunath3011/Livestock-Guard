import React, { useState, useMemo } from 'react';
import { Animal, Species, HealthStatus, Farm, User, Case, VaccinationRecord, TreatmentRecord, LabSample, AnimalPhoto } from '../../types';
import { store } from '../../services/store';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import { IndiaLocationPicker } from '../common/IndiaLocationPicker';
import { NormalizedLocationSelection } from '../../types/location';
import { indiaLocationService } from '../../services/IndiaLocationService';
import { useTranslation } from '../../i18n/translations';
import { PhotoEvidenceSection } from '../common/PhotoEvidenceSection';
import {
  PawPrint,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Syringe,
  Pill,
  QrCode,
  Calendar,
  Layers,
  MapPin,
  Stethoscope,
  FlaskConical,
  Clock,
  User as UserIcon,
  ShieldCheck,
  Activity,
  ChevronRight,
  FileText,
  Edit3,
  Camera
} from 'lucide-react';

interface AnimalsViewProps {
  animals: Animal[];
  farms: Farm[];
  currentUser: User;
  onSelectAnimal?: (animal: Animal) => void;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  animals,
  farms,
  currentUser,
  onSelectAnimal
}) => {
  const { t, currentLang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAnimalDetail, setSelectedAnimalDetail] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SYMPTOMS' | 'PHOTOS' | 'VACCINATIONS' | 'TREATMENTS' | 'LABS' | 'TIMELINE'>('OVERVIEW');

  // New Animal Form State
  const [newTag, setNewTag] = useState('');
  const [newSpecies, setNewSpecies] = useState<Species>('Cattle');
  const [newBreed, setNewBreed] = useState('Gir Cow');
  const [newName, setNewName] = useState('');
  const [newSex, setNewSex] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [newAge, setNewAge] = useState<number>(3.5);
  const [newWeight, setNewWeight] = useState<number>(380);
  const [newFarmId, setNewFarmId] = useState<string>(farms?.[0]?.id || 'farm_01');
  const [isCustomLocationOpen, setIsCustomLocationOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState<NormalizedLocationSelection | null>(null);
  const [registrationPhotos, setRegistrationPhotos] = useState<AnimalPhoto[]>([]);

  // Context store queries for selected animal
  const cases = store.getCases() || [];
  const vaccinations = store.getVaccinations() || [];
  const treatments = store.getTreatments() || [];
  const labSamples = store.getLabSamples() || [];

  // Filtered Animals
  const filteredAnimals = useMemo(() => {
    return (animals || []).filter(a => {
      if (speciesFilter !== 'ALL' && a.species !== speciesFilter) return false;
      if (statusFilter !== 'ALL' && a.currentHealthStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.tagNumber?.toLowerCase().includes(q) ||
          (a.name && a.name.toLowerCase().includes(q)) ||
          a.ownerName?.toLowerCase().includes(q) ||
          a.breed?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [animals, speciesFilter, statusFilter, searchQuery]);

  const handleRegisterAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) {
      alert('Please enter an ear tag number.');
      return;
    }

    const farmObj = (farms || []).find(f => f.id === newFarmId);
    const loc = customLocation || (farmObj ? {
      stateId: farmObj.stateId,
      districtId: farmObj.districtId,
      subDistrictId: farmObj.blockId,
      villageId: farmObj.villageId,
      coordinates: { latitude: farmObj.latitude, longitude: farmObj.longitude }
    } : null);

    store.registerAnimal({
      tagNumber: newTag.trim().toUpperCase(),
      species: newSpecies,
      breed: newBreed,
      name: newName || undefined,
      sex: newSex,
      ageYears: newAge,
      weightKg: newWeight,
      pregnancyStatus: 'NOT_PREGNANT',
      currentHealthStatus: 'HEALTHY',
      farmId: newFarmId,
      farmName: farmObj?.name || 'Local Farm Unit',
      ownerId: currentUser?.id || 'usr_farmer_01',
      ownerName: currentUser?.name || 'Farmer',
      stateId: loc?.stateId || farmObj?.stateId || 'st_in_mh',
      districtId: loc?.districtId || farmObj?.districtId || 'dt_in_mh_pune',
      blockId: loc?.subDistrictId || farmObj?.blockId || 'sd_in_mh_pune_baramati',
      villageId: loc?.villageId || farmObj?.villageId || 'vl_in_mh_pune_baramati_malegaon_bk',
      latitude: loc?.coordinates?.latitude || farmObj?.latitude || 18.1524,
      longitude: loc?.coordinates?.longitude || farmObj?.longitude || 74.5768,
      photos: registrationPhotos
    });

    setIsRegisterModalOpen(false);
    setNewTag('');
    setNewName('');
    setRegistrationPhotos([]);
    setIsCustomLocationOpen(false);
    setCustomLocation(null);
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UNDER_OBSERVATION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'AFFECTED':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'RECOVERED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'DECEASED':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Associated records for current selected animal
  const animalCases = useMemo(() => {
    if (!selectedAnimalDetail) return [];
    return cases.filter(c => c.animalId === selectedAnimalDetail.id || c.animalTag === selectedAnimalDetail.tagNumber || c.ownerName === selectedAnimalDetail.ownerName);
  }, [selectedAnimalDetail, cases]);

  const animalVaccines = useMemo(() => {
    if (!selectedAnimalDetail) return [];
    return vaccinations.filter(v => v.animalId === selectedAnimalDetail.id || v.animalTag === selectedAnimalDetail.tagNumber);
  }, [selectedAnimalDetail, vaccinations]);

  const animalTreatments = useMemo(() => {
    if (!selectedAnimalDetail) return [];
    return treatments.filter(t => t.animalId === selectedAnimalDetail.id || t.animalTag === selectedAnimalDetail.tagNumber);
  }, [selectedAnimalDetail, treatments]);

  const animalLabs = useMemo(() => {
    if (!selectedAnimalDetail) return [];
    return labSamples.filter(l => l.animalId === selectedAnimalDetail.id || l.animalTag === selectedAnimalDetail.tagNumber);
  }, [selectedAnimalDetail, labSamples]);

  const allAnimalPhotos = useMemo(() => {
    if (!selectedAnimalDetail) return [];
    const directPhotos = selectedAnimalDetail.photos || [];
    const casePhotos = animalCases.flatMap(c => c.photos || []);
    const photoMap = new Map<string, AnimalPhoto>();
    [...directPhotos, ...casePhotos].forEach(p => {
      if (p.id) photoMap.set(p.id, p);
    });
    return Array.from(photoMap.values());
  }, [selectedAnimalDetail, animalCases]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <PawPrint className="w-4 h-4" />
            {t('animals', 'Livestock Registry & Identification')}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {currentUser.role === 'FARMER' ? t('myHerd', 'My Animals') : t('animals', 'Animals')} ({(animals || []).length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('routinePrevention', 'Track individual animal profiles, digital ear tags, health history and immunization logs.')}
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {t('registerAnimal', 'Register New Animal')}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', 'Search by Ear Tag, Breed, Owner, or Name...')}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Species filter */}
          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">{t('allSpecies', 'All Species')}</option>
            <option value="Cattle">{t('cattle', 'Cattle')}</option>
            <option value="Buffalo">{t('buffalo', 'Buffalo')}</option>
            <option value="Goat">{t('goat', 'Goat')}</option>
            <option value="Sheep">{t('sheep', 'Sheep')}</option>
            <option value="Pig">{t('pig', 'Pig')}</option>
            <option value="Poultry">{t('poultry', 'Poultry')}</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">{t('allStatus', 'All Health Statuses')}</option>
            <option value="HEALTHY">{t('healthy', 'Healthy')}</option>
            <option value="UNDER_OBSERVATION">{t('underObservation', 'Under Observation')}</option>
            <option value="AFFECTED">{t('affected', 'Affected (Sick)')}</option>
            <option value="RECOVERED">{t('recovered', 'Recovered')}</option>
            <option value="DECEASED">{t('deceased', 'Deceased')}</option>
          </select>
        </div>
      </div>

      {/* Livestock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">{t('earTagId', 'Ear Tag ID')}</th>
                <th className="px-4 py-3.5">{t('species', 'Species & Breed')}</th>
                <th className="px-4 py-3.5">{t('sexAge', 'Sex & Age')}</th>
                <th className="px-4 py-3.5">{t('ownerFarm', 'Owner & Holding')}</th>
                <th className="px-4 py-3.5">{t('healthStatus', 'Health Status')}</th>
                <th className="px-4 py-3.5">{t('vaccinationStatus', 'Vaccines')}</th>
                <th className="px-4 py-3.5 text-right">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredAnimals || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No animals found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredAnimals.map(animal => (
                  <tr
                    key={animal.id}
                    onClick={() => setSelectedAnimalDetail(animal)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-emerald-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      {animal.tagNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{animal.species}</span>
                      <span className="text-slate-500 block text-[11px]">{animal.breed} {animal.name ? `(${animal.name})` : ''}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {animal.sex} • {animal.ageYears} yrs ({animal.weightKg} kg)
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="font-semibold text-slate-800">{animal.ownerName}</span>
                      <span className="text-[11px] text-slate-400 block">{animal.villageId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] ${getStatusColor(animal.currentHealthStatus)}`}>
                        {animal.currentHealthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">
                      {animal.vaccinationCount} Doses
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedAnimalDetail(animal);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Animal Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Livestock Tag"
        subtitle="Create official digital animal passport with unique ear tag identifier."
        maxWidth="xl"
      >
        <form onSubmit={handleRegisterAnimal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Ear Tag Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IN-MH-2026-9901"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Species *
              </label>
              <select
                value={newSpecies}
                onChange={e => setNewSpecies(e.target.value as Species)}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Breed / Variety
              </label>
              <input
                type="text"
                value={newBreed}
                onChange={e => setNewBreed(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Animal Name / Calling ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ganga / Lakshmi"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={newSex}
                onChange={e => setNewSex(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="FEMALE">Female (Cow / Dam / Doe)</option>
                <option value="MALE">Male (Bull / Sire / Buck)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newAge}
                onChange={e => setNewAge(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farm / Holding Unit *
              </label>
              <select
                value={newFarmId}
                onChange={e => {
                  setNewFarmId(e.target.value);
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
          </div>

          {/* Farm Location Inheritance & Custom Override Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Animal Geographic Location (Pan-India)
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
                      const f = farms.find(farm => farm.id === newFarmId);
                      return f ? `${f.villageName || f.villageId}, ${f.blockName || f.blockId}, ${f.districtName || f.districtId}, ${f.stateName || 'Maharashtra'}` : 'Location inherited from farm holding';
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
                  title="Select Custom State, District, Block & Village"
                />
              </div>
            )}
          </div>

          {/* Animal Identification Photo Evidence (Optional) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <PhotoEvidenceSection
              photos={registrationPhotos}
              onChange={setRegistrationPhotos}
              currentUserRole={currentUser.role}
              animalId={newTag || 'anm_new'}
              maxPhotos={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Register Animal
            </button>
          </div>
        </form>
      </Modal>

      {/* Comprehensive Animal Profile Modal with Full Tabs */}
      {selectedAnimalDetail && (
        <Modal
          isOpen={!!selectedAnimalDetail}
          onClose={() => setSelectedAnimalDetail(null)}
          title={`Animal Passport: ${selectedAnimalDetail.tagNumber}`}
          subtitle={`${selectedAnimalDetail.species} • ${selectedAnimalDetail.breed} • Owner: ${selectedAnimalDetail.ownerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Top Identity Header Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl font-black text-emerald-800">
                  {selectedAnimalDetail.species === 'Cattle' ? '🐄' : selectedAnimalDetail.species === 'Buffalo' ? '🐃' : selectedAnimalDetail.species === 'Goat' ? '🐐' : '🐑'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900">{selectedAnimalDetail.tagNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(selectedAnimalDetail.currentHealthStatus)}`}>
                      {selectedAnimalDetail.currentHealthStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAnimalDetail.breed} • {selectedAnimalDetail.sex} • {selectedAnimalDetail.ageYears} yrs ({selectedAnimalDetail.weightKg} kg)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Farm Unit</span>
                <p className="text-xs font-bold text-slate-800">{selectedAnimalDetail.farmName}</p>
                <span className="text-[11px] text-slate-500">{selectedAnimalDetail.villageId}</span>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
              {[
                { id: 'OVERVIEW', label: 'Overview', icon: PawPrint },
                { id: 'SYMPTOMS', label: 'Clinical History', icon: Stethoscope, count: animalCases.length },
                { id: 'PHOTOS', label: 'Photo Evidence', icon: Camera, count: allAnimalPhotos.length },
                { id: 'VACCINATIONS', label: 'Vaccines', icon: Syringe, count: animalVaccines.length },
                { id: 'TREATMENTS', label: 'Treatments', icon: Pill, count: animalTreatments.length },
                { id: 'LABS', label: 'Lab Tests', icon: FlaskConical, count: animalLabs.length },
                { id: 'TIMELINE', label: 'Timeline', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pregnancy Status</span>
                    <span className="font-bold text-slate-800">{selectedAnimalDetail.pregnancyStatus.replace('_', ' ')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lactation Count</span>
                    <span className="font-bold text-slate-800">{selectedAnimalDetail.lactationCount || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date</span>
                    <span className="font-bold text-slate-800">{selectedAnimalDetail.registeredAt}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-950 block">Biosecurity & Vaccine Passport Active</span>
                      <p className="text-[11px] text-emerald-800">
                        Total {selectedAnimalDetail.vaccinationCount} vaccination doses recorded in official national ledger.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Symptoms & Cases */}
            {activeTab === 'SYMPTOMS' && (
              <div className="space-y-3">
                {animalCases.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No clinical reports filed for this animal. Animal is healthy.
                  </div>
                ) : (
                  animalCases.map(c => (
                    <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{c.caseNumber}</span>
                        <CaseStatusBadge status={c.status} size="sm" />
                      </div>
                      <p className="text-slate-700">
                        Suspected: <strong>{c.suspectedDiseases?.[0]?.diseaseName || 'General Triage'}</strong>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(c.symptoms || []).map(s => (
                          <span key={s.symptomId} className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {s.symptomName} ({s.severity})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Photo Evidence & Verification */}
            {activeTab === 'PHOTOS' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <PhotoEvidenceSection
                    photos={allAnimalPhotos}
                    onChange={(updatedPhotos) => {
                      if (selectedAnimalDetail) {
                        // Persist any new or updated photo to this animal
                        const currentCount = (selectedAnimalDetail.photos || []).length;
                        if (updatedPhotos.length > currentCount) {
                          const latest = updatedPhotos[updatedPhotos.length - 1];
                          store.addPhotoToAnimal(selectedAnimalDetail.id, latest);
                        }
                      }
                    }}
                    allowVetReview={currentUser.role === 'VETERINARIAN' || currentUser.role === 'FIELD_WORKER' || currentUser.role === 'STATE_ADMIN'}
                    currentUserRole={currentUser.role}
                    animalId={selectedAnimalDetail.id}
                    maxPhotos={6}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Vaccinations */}
            {activeTab === 'VACCINATIONS' && (
              <div className="space-y-3">
                {animalVaccines.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No individual immunization doses logged.
                  </div>
                ) : (
                  animalVaccines.map(v => (
                    <div key={v.id} className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-blue-950 block">{v.vaccineName}</span>
                        <span className="text-[11px] text-slate-500">Batch: {v.batchNumber} • Given on {v.dateAdministered}</span>
                      </div>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        Dose #{v.doseNumber} ({v.status})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Treatments */}
            {activeTab === 'TREATMENTS' && (
              <div className="space-y-3">
                {animalTreatments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No prescription treatments recorded.
                  </div>
                ) : (
                  animalTreatments.map(t => (
                    <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{t.suspectedDisease}</span>
                        <span className="text-[10px] text-slate-400">{t.treatmentDate}</span>
                      </div>
                      <p className="text-slate-600">Prescribed by {t.veterinarianName} ({t.treatmentResponse})</p>
                      <div className="text-[11px] bg-white p-2 rounded-lg border border-slate-200 font-mono text-slate-700">
                        {(t.medicines || []).map(m => `${m.medicineName} ${m.dosage} (${m.route}) for ${m.durationDays}d`).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 5: Laboratory */}
            {activeTab === 'LABS' && (
              <div className="space-y-3">
                {animalLabs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No diagnostic lab samples dispatched.
                  </div>
                ) : (
                  animalLabs.map(l => (
                    <div key={l.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">Sample #{l.sampleCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.result === 'POSITIVE' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {l.result || l.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{l.sampleType} • Test: {l.testRequested}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 6: Timeline */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-3 text-xs pl-2 border-l-2 border-slate-200">
                <div className="relative pl-4 space-y-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -left-[19px] top-1" />
                  <span className="text-[10px] text-slate-400 font-mono">Today</span>
                  <p className="font-bold text-slate-900">Health Status Verified: {selectedAnimalDetail.currentHealthStatus}</p>
                </div>
                <div className="relative pl-4 space-y-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[19px] top-1" />
                  <span className="text-[10px] text-slate-400 font-mono">{selectedAnimalDetail.registeredAt}</span>
                  <p className="font-bold text-slate-900">Initial Registration & Tag Allotment ({selectedAnimalDetail.tagNumber})</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedAnimalDetail(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Animal Passport
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
