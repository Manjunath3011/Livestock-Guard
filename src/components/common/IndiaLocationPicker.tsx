import React, { useState, useEffect, useMemo } from 'react';
import {
  IndianState,
  IndianDistrict,
  IndianSubDistrict,
  IndianVillage,
  NormalizedLocationSelection,
  LocationSearchResult,
  GeoCoordinates
} from '../../types/location';
import { Farm, LanguageCode } from '../../types';
import { indiaLocationService } from '../../services/IndiaLocationService';
import {
  MapPin,
  Search,
  Crosshair,
  ChevronDown,
  Building2,
  Layers,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Navigation,
  Globe,
  Compass
} from 'lucide-react';

interface IndiaLocationPickerProps {
  value?: Partial<NormalizedLocationSelection>;
  onChange: (selection: NormalizedLocationSelection) => void;
  mode?: 'FULL' | 'CASCADING' | 'GLOBAL_SEARCH' | 'INHERITED_FARM';
  inheritedFarm?: Farm | null;
  showCoordinates?: boolean;
  showAddressLine?: boolean;
  showGpsButton?: boolean;
  label?: string;
  title?: string;
  disabled?: boolean;
  language?: LanguageCode;
  required?: boolean;
  compact?: boolean;
  onCustomVillageCreated?: (village: IndianVillage) => void;
}

export const IndiaLocationPicker: React.FC<IndiaLocationPickerProps> = ({
  value,
  onChange,
  mode = 'FULL',
  inheritedFarm,
  showCoordinates = true,
  showAddressLine = true,
  showGpsButton = true,
  label,
  title,
  disabled = false,
  language = 'en',
  required = true,
  compact = false,
  onCustomVillageCreated
}) => {
  const displayLabel = title || label || 'Pan-India Administrative Location & Address';
  // Active selection states
  const [selectedStateId, setSelectedStateId] = useState<string>(value?.stateId || 'st_in_mh');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(value?.districtId || 'dt_in_mh_pune');
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<string>(value?.subDistrictId || 'sd_in_mh_pune_baramati');
  const [selectedVillageId, setSelectedVillageId] = useState<string>(value?.villageId || 'vl_in_mh_pune_baramati_malegaon_bk');
  const [customAddress, setCustomAddress] = useState<string>(value?.addressLine || '');
  const [customPincode, setCustomPincode] = useState<string>(value?.pincode || '413115');
  const [coords, setCoords] = useState<GeoCoordinates>(
    value?.coordinates || { latitude: 18.1524, longitude: 74.5768, source: 'ADMIN_CENTROID' }
  );

  // Search & Tab states
  const [activeTab, setActiveTab] = useState<'CASCADING' | 'SEARCH'>(mode === 'GLOBAL_SEARCH' ? 'SEARCH' : 'CASCADING');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom Village Modal / Drawer
  const [isCustomVillageModalOpen, setIsCustomVillageModalOpen] = useState(false);
  const [newVillageName, setNewVillageName] = useState('');
  const [newGramPanchayat, setNewGramPanchayat] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Inherited farm unlock override state
  const [isInheritedLocked, setIsInheritedLocked] = useState(Boolean(inheritedFarm && mode === 'INHERITED_FARM'));

  // Data lists
  const states = useMemo(() => indiaLocationService.getStates(), []);
  const districts = useMemo(() => indiaLocationService.getDistricts(selectedStateId), [selectedStateId]);
  const subDistricts = useMemo(() => indiaLocationService.getSubDistricts(selectedDistrictId), [selectedDistrictId]);
  const villages = useMemo(() => indiaLocationService.getVillages(selectedSubDistrictId), [selectedSubDistrictId]);

  // Sync with value prop if changed externally
  useEffect(() => {
    if (value) {
      if (value.stateId && value.stateId !== selectedStateId) {
        setSelectedStateId(value.stateId);
      }
      if (value.districtId && value.districtId !== selectedDistrictId) {
        setSelectedDistrictId(value.districtId);
      }
      if (value.subDistrictId && value.subDistrictId !== selectedSubDistrictId) {
        setSelectedSubDistrictId(value.subDistrictId);
      }
      if (value.villageId && value.villageId !== selectedVillageId) {
        setSelectedVillageId(value.villageId);
      }
      if (value.pincode && value.pincode !== customPincode) {
        setCustomPincode(value.pincode);
      }
      if (value.addressLine !== undefined) {
        setCustomAddress(value.addressLine);
      }
      if (value.coordinates) {
        setCoords(value.coordinates);
      }
    }
  }, [value?.stateId, value?.districtId, value?.subDistrictId, value?.villageId, value?.pincode, value?.addressLine]);

  // Propagate state update
  const emitSelection = (
    sId: string,
    dId: string,
    sdId: string,
    vId: string,
    pincodeVal?: string,
    addressVal?: string,
    geoCoords?: GeoCoordinates
  ) => {
    const state = indiaLocationService.getStateById(sId);
    const district = indiaLocationService.getDistrictById(dId);
    const subDistrict = indiaLocationService.getSubDistrictById(sdId);
    const village = indiaLocationService.getVillageById(vId);

    const pin = pincodeVal || village?.pincode || '413101';
    const effectiveCoords = geoCoords || village?.coordinates || district?.centerCoordinates || { latitude: 18.5204, longitude: 73.8567 };

    const formattedAddress = indiaLocationService.formatHierarchyString({
      villageName: village?.name,
      subDistrictName: subDistrict?.name,
      districtName: district?.name,
      stateName: state?.name,
      pincode: pin
    });

    onChange({
      stateId: sId,
      stateCode: state?.code || 'MH',
      stateName: state?.name || 'Maharashtra',
      districtId: dId,
      districtName: district?.name || 'Pune',
      subDistrictId: sdId,
      subDistrictName: subDistrict?.name || 'Baramati',
      villageId: vId,
      villageName: village?.name || 'Malegaon Budruk',
      gramPanchayat: village?.gramPanchayat,
      pincode: pin,
      addressLine: addressVal ?? customAddress,
      coordinates: effectiveCoords,
      formattedAddress,
      isCustomVillage: village?.isCustom
    });
  };

  // State Change Handler
  const handleStateChange = (newStateId: string) => {
    setSelectedStateId(newStateId);
    const newDistricts = indiaLocationService.getDistricts(newStateId);
    const firstDistrict = newDistricts[0];

    if (firstDistrict) {
      setSelectedDistrictId(firstDistrict.id);
      const newSubDistricts = indiaLocationService.getSubDistricts(firstDistrict.id);
      const firstSubDistrict = newSubDistricts[0];

      if (firstSubDistrict) {
        setSelectedSubDistrictId(firstSubDistrict.id);
        const newVillages = indiaLocationService.getVillages(firstSubDistrict.id);
        const firstVillage = newVillages[0];

        if (firstVillage) {
          setSelectedVillageId(firstVillage.id);
          setCustomPincode(firstVillage.pincode || '413101');
          setCoords(firstVillage.coordinates);
          emitSelection(newStateId, firstDistrict.id, firstSubDistrict.id, firstVillage.id, firstVillage.pincode, customAddress, firstVillage.coordinates);
        } else {
          emitSelection(newStateId, firstDistrict.id, firstSubDistrict.id, '', '413101', customAddress);
        }
      }
    }
  };

  // District Change Handler
  const handleDistrictChange = (newDistrictId: string) => {
    setSelectedDistrictId(newDistrictId);
    const newSubDistricts = indiaLocationService.getSubDistricts(newDistrictId);
    const firstSubDistrict = newSubDistricts[0];

    if (firstSubDistrict) {
      setSelectedSubDistrictId(firstSubDistrict.id);
      const newVillages = indiaLocationService.getVillages(firstSubDistrict.id);
      const firstVillage = newVillages[0];

      if (firstVillage) {
        setSelectedVillageId(firstVillage.id);
        setCustomPincode(firstVillage.pincode || '413101');
        setCoords(firstVillage.coordinates);
        emitSelection(selectedStateId, newDistrictId, firstSubDistrict.id, firstVillage.id, firstVillage.pincode, customAddress, firstVillage.coordinates);
      } else {
        emitSelection(selectedStateId, newDistrictId, firstSubDistrict.id, '', '413101', customAddress);
      }
    }
  };

  // SubDistrict Change Handler
  const handleSubDistrictChange = (newSubDistrictId: string) => {
    setSelectedSubDistrictId(newSubDistrictId);
    const newVillages = indiaLocationService.getVillages(newSubDistrictId);
    const firstVillage = newVillages[0];

    if (firstVillage) {
      setSelectedVillageId(firstVillage.id);
      setCustomPincode(firstVillage.pincode || '413101');
      setCoords(firstVillage.coordinates);
      emitSelection(selectedStateId, selectedDistrictId, newSubDistrictId, firstVillage.id, firstVillage.pincode, customAddress, firstVillage.coordinates);
    } else {
      emitSelection(selectedStateId, selectedDistrictId, newSubDistrictId, '', '413101', customAddress);
    }
  };

  // Village Change Handler
  const handleVillageChange = (newVillageId: string) => {
    setSelectedVillageId(newVillageId);
    const v = indiaLocationService.getVillageById(newVillageId);
    if (v) {
      setCustomPincode(v.pincode || '413101');
      setCoords(v.coordinates);
      emitSelection(selectedStateId, selectedDistrictId, selectedSubDistrictId, newVillageId, v.pincode, customAddress, v.coordinates);
    }
  };

  // Search Results Handler
  useEffect(() => {
    if (globalSearchQuery.trim().length >= 2) {
      setIsSearching(true);
      const res = indiaLocationService.searchLocations(globalSearchQuery, 8);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [globalSearchQuery]);

  const handleSelectSearchResult = (result: LocationSearchResult) => {
    setSelectedStateId(result.stateId);
    setSelectedDistrictId(result.districtId);
    if (result.subDistrictId) {
      setSelectedSubDistrictId(result.subDistrictId);
    }
    if (result.villageId) {
      setSelectedVillageId(result.villageId);
    }
    if (result.pincode) {
      setCustomPincode(result.pincode);
    }
    setCoords(result.coordinates);
    setGlobalSearchQuery('');
    setSearchResults([]);

    emitSelection(
      result.stateId,
      result.districtId,
      result.subDistrictId || selectedSubDistrictId,
      result.villageId || selectedVillageId,
      result.pincode || customPincode,
      customAddress,
      result.coordinates
    );
  };

  // GPS Geolocation Handler
  const handleCaptureGps = () => {
    setGpsError(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      // Fallback with simulated high-accuracy point for current village
      const currentV = indiaLocationService.getVillageById(selectedVillageId);
      const lat = currentV?.coordinates.latitude || 18.1524;
      const lng = currentV?.coordinates.longitude || 74.5768;
      const nearest = indiaLocationService.findNearestAdminLocation(lat, lng);

      setCoords(nearest.coordinates);
      onChange(nearest);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const acc = Math.round(pos.coords.accuracy || 8);

        const nearest = indiaLocationService.findNearestAdminLocation(lat, lng);
        nearest.coordinates.accuracyMeters = acc;

        setSelectedStateId(nearest.stateId);
        setSelectedDistrictId(nearest.districtId);
        setSelectedSubDistrictId(nearest.subDistrictId);
        setSelectedVillageId(nearest.villageId);
        setCustomPincode(nearest.pincode);
        setCoords(nearest.coordinates);

        onChange(nearest);
        setIsLocating(false);
      },
      err => {
        console.warn('Geolocation access error, falling back to centroid:', err.message);
        // Fallback to district centroid
        const dist = indiaLocationService.getDistrictById(selectedDistrictId);
        if (dist) {
          const nearest = indiaLocationService.findNearestAdminLocation(
            dist.centerCoordinates.latitude,
            dist.centerCoordinates.longitude
          );
          setSelectedStateId(nearest.stateId);
          setSelectedDistrictId(nearest.districtId);
          setSelectedSubDistrictId(nearest.subDistrictId);
          setSelectedVillageId(nearest.villageId);
          setCoords(nearest.coordinates);
          onChange(nearest);
        }
        setGpsError('GPS accuracy simulated using regional administrative centroid.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Custom Village Creation
  const handleAddCustomVillage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;

    const created = indiaLocationService.registerCustomVillage({
      name: newVillageName.trim(),
      gramPanchayat: newGramPanchayat.trim() || undefined,
      pincode: newPincode.trim() || customPincode,
      subDistrictId: selectedSubDistrictId,
      districtId: selectedDistrictId,
      stateId: selectedStateId
    });

    setSelectedVillageId(created.id);
    setCustomPincode(created.pincode);
    setCoords(created.coordinates);

    emitSelection(
      selectedStateId,
      selectedDistrictId,
      selectedSubDistrictId,
      created.id,
      created.pincode,
      customAddress,
      created.coordinates
    );

    if (onCustomVillageCreated) {
      onCustomVillageCreated(created);
    }

    setIsCustomVillageModalOpen(false);
    setNewVillageName('');
    setNewGramPanchayat('');
    setNewPincode('');
  };

  // Display Objects
  const currentStateObj = indiaLocationService.getStateById(selectedStateId);
  const currentDistrictObj = indiaLocationService.getDistrictById(selectedDistrictId);
  const currentSubDistrictObj = indiaLocationService.getSubDistrictById(selectedSubDistrictId);
  const currentVillageObj = indiaLocationService.getVillageById(selectedVillageId);

  // If locked to inherited farm
  if (inheritedFarm && isInheritedLocked) {
    return (
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Permanent Farm Location (Inherited)
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {inheritedFarm.name}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInheritedLocked(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 transition-all shadow-xs cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            Change Location
          </button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {inheritedFarm.address || 'Patil Farmstead'}, Baramati Block, Pune District, Maharashtra
            </span>
          </div>
          <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
            GPS: {inheritedFarm.latitude.toFixed(4)}°N, {inheritedFarm.longitude.toFixed(4)}°E
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Switcher & GPS Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            {displayLabel}
            {required && <span className="text-rose-500">*</span>}
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            LGD-compliant administrative hierarchy across all 36 Indian States & UTs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'FULL' && (
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('CASCADING')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'CASCADING'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Cascading
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SEARCH')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'SEARCH'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Instant Search
              </button>
            </div>
          )}

          {showGpsButton && (
            <button
              type="button"
              disabled={disabled || isLocating}
              onClick={handleCaptureGps}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
            </button>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* SEARCH MODE */}
      {activeTab === 'SEARCH' && (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Village, Sub-District, District, State, or Pincode (e.g. Baramati, 413115, Kolar)..."
              value={globalSearchQuery}
              onChange={e => setGlobalSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {searchResults.map(result => (
                <button
                  key={`${result.type}_${result.id}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {result.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {result.type}
                      </span>
                      {result.pincode && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {result.pincode}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {result.hierarchyText}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CASCADING DROPDOWNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* State / UT */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            1. State / Union Territory *
          </label>
          <div className="relative">
            <select
              value={selectedStateId}
              disabled={disabled}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer pr-8 truncate"
            >
              <optgroup label="States (28)">
                {states
                  .filter(s => s.type === 'STATE')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Union Territories (8)">
                {states
                  .filter(s => s.type === 'UT')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            2. District *
          </label>
          <div className="relative">
            <select
              value={selectedDistrictId}
              disabled={disabled || districts.length === 0}
              onChange={e => handleDistrictChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer pr-8 truncate"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Sub-District / Taluka / Block */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            3. Block / Taluka / Mandal *
          </label>
          <div className="relative">
            <select
              value={selectedSubDistrictId}
              disabled={disabled || subDistricts.length === 0}
              onChange={e => handleSubDistrictChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer pr-8 truncate"
            >
              {subDistricts.map(sd => (
                <option key={sd.id} value={sd.id}>
                  {sd.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Village / Town */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              4. Village / Town *
            </label>
            <button
              type="button"
              onClick={() => setIsCustomVillageModalOpen(true)}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Hamlet
            </button>
          </div>
          <div className="relative">
            <select
              value={selectedVillageId}
              disabled={disabled || villages.length === 0}
              onChange={e => handleVillageChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer pr-8 truncate"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.pincode ? `(${v.pincode})` : ''} {v.isCustom ? '★ Custom' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Address Line & Pincode */}
      {showAddressLine && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Farmstead / Holding Street Address / Landmark
            </label>
            <input
              type="text"
              disabled={disabled}
              placeholder="e.g. Survey No. 42/2, Near Milk Cooperative Chilling Center"
              value={customAddress}
              onChange={e => {
                setCustomAddress(e.target.value);
                emitSelection(
                  selectedStateId,
                  selectedDistrictId,
                  selectedSubDistrictId,
                  selectedVillageId,
                  customPincode,
                  e.target.value,
                  coords
                );
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Postal Pincode *
            </label>
            <input
              type="text"
              maxLength={6}
              disabled={disabled}
              placeholder="413115"
              value={customPincode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setCustomPincode(val);
                emitSelection(
                  selectedStateId,
                  selectedDistrictId,
                  selectedSubDistrictId,
                  selectedVillageId,
                  val,
                  customAddress,
                  coords
                );
              }}
              className="w-full font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Selected Location Summary Pill */}
      {showCoordinates && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">
              {currentVillageObj?.name || 'Village'}, {currentSubDistrictObj?.name || 'Block'}, {currentDistrictObj?.name || 'District'}, {currentStateObj?.name || 'State'} - {customPincode}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>{coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E</span>
            {coords.accuracyMeters && (
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-sans">
                ±{coords.accuracyMeters}m
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal to register custom village/hamlet */}
      {isCustomVillageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Revenue Village or Hamlet
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Parent: {currentSubDistrictObj?.name}, {currentDistrictObj?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomVillageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomVillage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Village / Wasti / Hamlet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhangarwadi / Vithal Mandir Wasti"
                  value={newVillageName}
                  onChange={e => setNewVillageName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gram Panchayat (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Malegaon Gram Panchayat"
                  value={newGramPanchayat}
                  onChange={e => setNewGramPanchayat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pincode (Optional)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="413115"
                  value={newPincode}
                  onChange={e => setNewPincode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomVillageModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20"
                >
                  Save & Select Village
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
