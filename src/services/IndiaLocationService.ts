import {
  IndianState,
  IndianDistrict,
  IndianSubDistrict,
  IndianVillage,
  NormalizedLocationSelection,
  LocationSearchResult,
  GeoCoordinates
} from '../types/location';
import { LocationHierarchy } from '../types';
import { INDIAN_STATES } from '../data/indiaLocations/states';
import { INDIAN_DISTRICTS } from '../data/indiaLocations/districts';
import { INDIAN_SUB_DISTRICTS } from '../data/indiaLocations/subdistricts';
import { INDIAN_VILLAGES } from '../data/indiaLocations/villages';

const CUSTOM_VILLAGES_STORAGE_KEY = 'lg_custom_villages';
const OFFLINE_LOCATION_CACHE_KEY = 'lg_offline_location_cache';
const RECENT_LOCATIONS_KEY = 'lg_recent_locations';

class IndiaLocationService {
  private states: IndianState[] = INDIAN_STATES;
  private districts: IndianDistrict[] = INDIAN_DISTRICTS;
  private subDistricts: IndianSubDistrict[] = INDIAN_SUB_DISTRICTS;
  private villages: IndianVillage[] = INDIAN_VILLAGES;
  private customVillages: IndianVillage[] = [];

  constructor() {
    this.loadCustomVillages();
  }

  private loadCustomVillages() {
    try {
      const stored = localStorage.getItem(CUSTOM_VILLAGES_STORAGE_KEY);
      if (stored) {
        this.customVillages = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load custom villages from storage:', e);
    }
  }

  private saveCustomVillages() {
    try {
      localStorage.setItem(CUSTOM_VILLAGES_STORAGE_KEY, JSON.stringify(this.customVillages));
    } catch (e) {
      console.warn('Could not save custom villages to storage:', e);
    }
  }

  // ==========================================
  // STATES & UTs
  // ==========================================

  public getStates(): IndianState[] {
    return [...this.states].sort((a, b) => a.name.localeCompare(b.name));
  }

  public getStateById(stateIdOrCodeOrAlias: string): IndianState | undefined {
    if (!stateIdOrCodeOrAlias) return undefined;
    const q = stateIdOrCodeOrAlias.toLowerCase().trim();
    return this.states.find(
      s =>
        s.id.toLowerCase() === q ||
        s.code.toLowerCase() === q ||
        s.name.toLowerCase() === q ||
        s.aliases?.some(a => a.toLowerCase() === q)
    );
  }

  // ==========================================
  // DISTRICTS
  // ==========================================

  public getDistricts(stateIdOrCode?: string): IndianDistrict[] {
    if (!stateIdOrCode) {
      return [...this.districts].sort((a, b) => a.name.localeCompare(b.name));
    }

    const state = this.getStateById(stateIdOrCode);
    if (!state) {
      // Direct filter if state not found
      return this.districts
        .filter(d => d.stateId.toLowerCase() === stateIdOrCode.toLowerCase())
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return this.districts
      .filter(d => d.stateId === state.id || d.stateCode === state.code)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public getDistrictById(districtIdOrAlias: string): IndianDistrict | undefined {
    if (!districtIdOrAlias) return undefined;
    const q = districtIdOrAlias.toLowerCase().trim();
    return this.districts.find(
      d =>
        d.id.toLowerCase() === q ||
        d.name.toLowerCase() === q ||
        d.aliases?.some(a => a.toLowerCase() === q)
    );
  }

  // ==========================================
  // SUB-DISTRICTS / TALUKAS / BLOCKS / MANDALS
  // ==========================================

  public getSubDistricts(districtIdOrAlias: string): IndianSubDistrict[] {
    const district = this.getDistrictById(districtIdOrAlias);
    const resolvedDistrictId = district ? district.id : districtIdOrAlias;

    const matched = this.subDistricts.filter(
      sd => sd.districtId.toLowerCase() === resolvedDistrictId.toLowerCase()
    );

    if (matched.length > 0) {
      return matched.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Dynamic procedural generation for districts without explicit pre-cached sub-districts
    const distName = district ? district.name.replace(/\s*\(.*?\)\s*/g, '') : 'District';
    const stateObj = district ? this.getStateById(district.stateId) : undefined;
    const subType = stateObj?.zone === 'SOUTH' && stateObj.code !== 'KA' ? 'MANDAL' : stateObj?.zone === 'NORTH' ? 'BLOCK' : 'TALUKA';

    return [
      {
        id: `sd_${resolvedDistrictId}_central`,
        districtId: resolvedDistrictId,
        stateId: district?.stateId || 'st_in_mh',
        lgdCode: Math.floor(1000 + Math.random() * 9000),
        name: `${distName} Central ${subType === 'MANDAL' ? 'Mandal' : subType === 'BLOCK' ? 'Block' : 'Taluka'}`,
        type: subType,
        localNames: {},
        centerCoordinates: district?.centerCoordinates
      },
      {
        id: `sd_${resolvedDistrictId}_north`,
        districtId: resolvedDistrictId,
        stateId: district?.stateId || 'st_in_mh',
        lgdCode: Math.floor(1000 + Math.random() * 9000),
        name: `${distName} North ${subType === 'MANDAL' ? 'Mandal' : subType === 'BLOCK' ? 'Block' : 'Taluka'}`,
        type: subType,
        localNames: {},
        centerCoordinates: district?.centerCoordinates
      },
      {
        id: `sd_${resolvedDistrictId}_south`,
        districtId: resolvedDistrictId,
        stateId: district?.stateId || 'st_in_mh',
        lgdCode: Math.floor(1000 + Math.random() * 9000),
        name: `${distName} Rural ${subType === 'MANDAL' ? 'Mandal' : subType === 'BLOCK' ? 'Block' : 'Taluka'}`,
        type: subType,
        localNames: {},
        centerCoordinates: district?.centerCoordinates
      }
    ];
  }

  public getSubDistrictById(subDistrictIdOrAlias: string): IndianSubDistrict | undefined {
    if (!subDistrictIdOrAlias) return undefined;
    const q = subDistrictIdOrAlias.toLowerCase().trim();
    const found = this.subDistricts.find(
      sd =>
        sd.id.toLowerCase() === q ||
        sd.name.toLowerCase() === q ||
        sd.aliases?.some(a => a.toLowerCase() === q)
    );
    if (found) return found;

    // Check procedurally generated ID pattern
    if (q.startsWith('sd_') && q.includes('_')) {
      const parts = q.split('_');
      const districtId = parts.slice(0, -1).join('_');
      const subDistricts = this.getSubDistricts(districtId);
      return subDistricts.find(sd => sd.id.toLowerCase() === q);
    }
    return undefined;
  }

  // ==========================================
  // VILLAGES / TOWNS / CITIES
  // ==========================================

  public getVillages(subDistrictIdOrAlias: string): IndianVillage[] {
    const subDistrict = this.getSubDistrictById(subDistrictIdOrAlias);
    const resolvedSubDistrictId = subDistrict ? subDistrict.id : subDistrictIdOrAlias;

    const matchedStatic = this.villages.filter(
      v => v.subDistrictId.toLowerCase() === resolvedSubDistrictId.toLowerCase()
    );

    const matchedCustom = this.customVillages.filter(
      v => v.subDistrictId.toLowerCase() === resolvedSubDistrictId.toLowerCase()
    );

    const allMatched = [...matchedStatic, ...matchedCustom];

    if (allMatched.length > 0) {
      return allMatched.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Generate starter revenue villages for seamless selection
    const subName = subDistrict ? subDistrict.name.replace(/\s*(Taluka|Block|Mandal|Sub-Division)\s*/gi, '').trim() : 'Local';
    const distObj = subDistrict ? this.getDistrictById(subDistrict.districtId) : undefined;
    const baseLat = subDistrict?.centerCoordinates?.latitude || distObj?.centerCoordinates?.latitude || 18.5204;
    const baseLng = subDistrict?.centerCoordinates?.longitude || distObj?.centerCoordinates?.longitude || 73.8567;

    return [
      {
        id: `vl_${resolvedSubDistrictId}_main`,
        subDistrictId: resolvedSubDistrictId,
        districtId: subDistrict?.districtId || 'dt_in_mh_pune',
        stateId: subDistrict?.stateId || 'st_in_mh',
        name: `${subName} Gramin`,
        gramPanchayat: `${subName} Gram Panchayat`,
        pincode: '413101',
        coordinates: {
          latitude: Number((baseLat + 0.012).toFixed(4)),
          longitude: Number((baseLng + 0.015).toFixed(4)),
          source: 'ADMIN_CENTROID'
        }
      },
      {
        id: `vl_${resolvedSubDistrictId}_kasba`,
        subDistrictId: resolvedSubDistrictId,
        districtId: subDistrict?.districtId || 'dt_in_mh_pune',
        stateId: subDistrict?.stateId || 'st_in_mh',
        name: `Kasba ${subName}`,
        gramPanchayat: `Kasba ${subName} Panchayat`,
        pincode: '413102',
        coordinates: {
          latitude: Number((baseLat - 0.018).toFixed(4)),
          longitude: Number((baseLng - 0.012).toFixed(4)),
          source: 'ADMIN_CENTROID'
        }
      },
      {
        id: `vl_${resolvedSubDistrictId}_wadi`,
        subDistrictId: resolvedSubDistrictId,
        districtId: subDistrict?.districtId || 'dt_in_mh_pune',
        stateId: subDistrict?.stateId || 'st_in_mh',
        name: `${subName} Gaon`,
        gramPanchayat: `${subName} Gaon Panchayat`,
        pincode: '413103',
        coordinates: {
          latitude: Number((baseLat + 0.025).toFixed(4)),
          longitude: Number((baseLng - 0.022).toFixed(4)),
          source: 'ADMIN_CENTROID'
        }
      }
    ];
  }

  public getVillageById(villageIdOrAlias: string): IndianVillage | undefined {
    if (!villageIdOrAlias) return undefined;
    const q = villageIdOrAlias.toLowerCase().trim();

    // Check predefined
    const predefined = this.villages.find(
      v =>
        v.id.toLowerCase() === q ||
        v.name.toLowerCase() === q ||
        v.aliases?.some(a => a.toLowerCase() === q)
    );
    if (predefined) return predefined;

    // Check custom
    const custom = this.customVillages.find(
      v =>
        v.id.toLowerCase() === q ||
        v.name.toLowerCase() === q ||
        v.aliases?.some(a => a.toLowerCase() === q)
    );
    if (custom) return custom;

    // Check generated
    if (q.startsWith('vl_') && q.includes('_')) {
      const parts = q.split('_');
      const subDistrictId = parts.slice(0, -1).join('_');
      const generated = this.getVillages(subDistrictId);
      return generated.find(v => v.id.toLowerCase() === q);
    }

    return undefined;
  }

  // ==========================================
  // CUSTOM VILLAGE REGISTRATION
  // ==========================================

  public registerCustomVillage(villageInput: {
    name: string;
    subDistrictId: string;
    districtId: string;
    stateId: string;
    pincode?: string;
    gramPanchayat?: string;
    coordinates?: GeoCoordinates;
  }): IndianVillage {
    const subDistrict = this.getSubDistrictById(villageInput.subDistrictId);
    const district = this.getDistrictById(villageInput.districtId);

    const safeName = villageInput.name.trim();
    const slug = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newId = `vl_custom_${villageInput.subDistrictId}_${slug}_${Date.now().toString().slice(-4)}`;

    const fallbackLat = subDistrict?.centerCoordinates?.latitude || district?.centerCoordinates?.latitude || 18.5204;
    const fallbackLng = subDistrict?.centerCoordinates?.longitude || district?.centerCoordinates?.longitude || 73.8567;

    const newVillage: IndianVillage = {
      id: newId,
      name: safeName,
      subDistrictId: villageInput.subDistrictId,
      districtId: villageInput.districtId,
      stateId: villageInput.stateId,
      gramPanchayat: villageInput.gramPanchayat || `${safeName} Gram Panchayat`,
      pincode: villageInput.pincode || '413101',
      coordinates: villageInput.coordinates || {
        latitude: fallbackLat,
        longitude: fallbackLng,
        source: 'MANUAL_ENTRY'
      },
      isCustom: true
    };

    this.customVillages.push(newVillage);
    this.saveCustomVillages();
    return newVillage;
  }

  // ==========================================
  // FAST MULTI-LEVEL SEARCH
  // ==========================================

  public searchLocations(query: string, limit: number = 8): LocationSearchResult[] {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.toLowerCase().trim();
    const results: LocationSearchResult[] = [];

    // Search Villages (Predefined & Custom)
    const allVillages = [...this.villages, ...this.customVillages];
    for (const v of allVillages) {
      if (
        v.name.toLowerCase().includes(cleanQuery) ||
        v.pincode?.includes(cleanQuery) ||
        v.aliases?.some(a => a.toLowerCase().includes(cleanQuery))
      ) {
        const district = this.getDistrictById(v.districtId);
        const state = this.getStateById(v.stateId);
        const subDistrict = this.getSubDistrictById(v.subDistrictId);

        results.push({
          id: v.id,
          name: v.name,
          type: 'VILLAGE',
          hierarchyText: `${v.name} • ${subDistrict?.name || 'Block'}, ${district?.name || 'District'}, ${state?.name || 'State'} ${v.pincode ? `(${v.pincode})` : ''}`,
          pincode: v.pincode,
          villageName: v.name,
          villageId: v.id,
          subDistrictName: subDistrict?.name,
          subDistrictId: v.subDistrictId,
          districtName: district?.name || 'District',
          districtId: v.districtId,
          stateName: state?.name || 'State',
          stateId: v.stateId,
          coordinates: v.coordinates
        });

        if (results.length >= limit) return results;
      }
    }

    // Search Sub-Districts
    for (const sd of this.subDistricts) {
      if (
        sd.name.toLowerCase().includes(cleanQuery) ||
        sd.aliases?.some(a => a.toLowerCase().includes(cleanQuery))
      ) {
        const district = this.getDistrictById(sd.districtId);
        const state = this.getStateById(sd.stateId);

        results.push({
          id: sd.id,
          name: sd.name,
          type: 'SUB_DISTRICT',
          hierarchyText: `${sd.name} • ${district?.name || 'District'}, ${state?.name || 'State'}`,
          subDistrictName: sd.name,
          subDistrictId: sd.id,
          districtName: district?.name || 'District',
          districtId: sd.districtId,
          stateName: state?.name || 'State',
          stateId: sd.stateId,
          coordinates: sd.centerCoordinates || district?.centerCoordinates || { latitude: 18.5204, longitude: 73.8567 }
        });

        if (results.length >= limit) return results;
      }
    }

    // Search Districts
    for (const d of this.districts) {
      if (
        d.name.toLowerCase().includes(cleanQuery) ||
        d.aliases?.some(a => a.toLowerCase().includes(cleanQuery))
      ) {
        const state = this.getStateById(d.stateId);

        results.push({
          id: d.id,
          name: d.name,
          type: 'DISTRICT',
          hierarchyText: `${d.name} District • ${state?.name || 'State'} (${d.stateCode})`,
          districtName: d.name,
          districtId: d.id,
          stateName: state?.name || 'State',
          stateId: d.stateId,
          coordinates: d.centerCoordinates
        });

        if (results.length >= limit) return results;
      }
    }

    // Search States
    for (const s of this.states) {
      if (
        s.name.toLowerCase().includes(cleanQuery) ||
        s.code.toLowerCase() === cleanQuery ||
        s.aliases?.some(a => a.toLowerCase().includes(cleanQuery))
      ) {
        results.push({
          id: s.id,
          name: s.name,
          type: 'STATE',
          hierarchyText: `${s.name} (${s.type === 'UT' ? 'Union Territory' : 'State'})`,
          stateName: s.name,
          stateId: s.id,
          districtName: s.capital,
          districtId: s.id,
          coordinates: s.centerCoordinates
        });

        if (results.length >= limit) return results;
      }
    }

    return results.slice(0, limit);
  }

  // ==========================================
  // REVERSE GEOCODING (NEAREST ADMINISTRATIVE NODE)
  // ==========================================

  public findNearestAdminLocation(latitude: number, longitude: number): NormalizedLocationSelection {
    // 1. Find closest village
    let closestVillage: IndianVillage | null = null;
    let minDistance = Infinity;

    const allVillages = [...this.villages, ...this.customVillages];
    for (const v of allVillages) {
      const d = this.calculateHaversineDistance(
        latitude,
        longitude,
        v.coordinates.latitude,
        v.coordinates.longitude
      );
      if (d < minDistance) {
        minDistance = d;
        closestVillage = v;
      }
    }

    if (closestVillage && minDistance <= 30) {
      const state = this.getStateById(closestVillage.stateId);
      const district = this.getDistrictById(closestVillage.districtId);
      const subDistrict = this.getSubDistrictById(closestVillage.subDistrictId);

      return {
        stateId: closestVillage.stateId,
        stateCode: state?.code || 'MH',
        stateName: state?.name || 'Maharashtra',
        districtId: closestVillage.districtId,
        districtName: district?.name || 'Pune',
        subDistrictId: closestVillage.subDistrictId,
        subDistrictName: subDistrict?.name || 'Baramati',
        villageId: closestVillage.id,
        villageName: closestVillage.name,
        gramPanchayat: closestVillage.gramPanchayat,
        pincode: closestVillage.pincode,
        coordinates: {
          latitude,
          longitude,
          source: 'GPS',
          accuracyMeters: 10,
          capturedAt: new Date().toISOString()
        },
        formattedAddress: `${closestVillage.name}, ${subDistrict?.name || 'Block'}, ${district?.name || 'District'}, ${state?.name || 'State'} - ${closestVillage.pincode}`
      };
    }

    // 2. Otherwise find closest district centroid
    let closestDistrict = this.districts[0];
    let minDistDist = Infinity;

    for (const d of this.districts) {
      const dist = this.calculateHaversineDistance(
        latitude,
        longitude,
        d.centerCoordinates.latitude,
        d.centerCoordinates.longitude
      );
      if (dist < minDistDist) {
        minDistDist = dist;
        closestDistrict = d;
      }
    }

    const stateObj = this.getStateById(closestDistrict.stateId);
    const subDistricts = this.getSubDistricts(closestDistrict.id);
    const primarySubDistrict = subDistricts[0];
    const villages = this.getVillages(primarySubDistrict.id);
    const primaryVillage = villages[0];

    return {
      stateId: closestDistrict.stateId,
      stateCode: closestDistrict.stateCode,
      stateName: closestDistrict.stateName,
      districtId: closestDistrict.id,
      districtName: closestDistrict.name,
      subDistrictId: primarySubDistrict.id,
      subDistrictName: primarySubDistrict.name,
      villageId: primaryVillage.id,
      villageName: primaryVillage.name,
      pincode: primaryVillage.pincode,
      coordinates: {
        latitude,
        longitude,
        source: 'GPS',
        accuracyMeters: 25,
        capturedAt: new Date().toISOString()
      },
      formattedAddress: `${primaryVillage.name}, ${primarySubDistrict.name}, ${closestDistrict.name}, ${stateObj?.name || 'State'} - ${primaryVillage.pincode}`
    };
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ==========================================
  // BACKWARD-COMPATIBILITY: LEGACY ADAPTER
  // ==========================================

  public getLegacyLocationData(): LocationHierarchy[] {
    return this.villages.map(v => {
      const district = this.getDistrictById(v.districtId);
      const state = this.getStateById(v.stateId);
      const subDistrict = this.getSubDistrictById(v.subDistrictId);

      return {
        stateId: v.stateId,
        stateName: state?.name || 'Maharashtra',
        districtId: v.districtId,
        districtName: district?.name || 'Pune',
        blockId: v.subDistrictId,
        blockName: subDistrict?.name || 'Baramati',
        villageId: v.id,
        villageName: v.name,
        latitude: v.coordinates.latitude,
        longitude: v.coordinates.longitude
      };
    });
  }

  // Format a human-readable address string from components
  public formatHierarchyString(params: {
    villageName?: string;
    subDistrictName?: string;
    districtName?: string;
    stateName?: string;
    pincode?: string;
  }): string {
    const parts = [
      params.villageName,
      params.subDistrictName,
      params.districtName ? `${params.districtName} District` : undefined,
      params.stateName
    ].filter(Boolean);

    let base = parts.join(', ');
    if (params.pincode) {
      base += ` - ${params.pincode}`;
    }
    return base;
  }
}

export const indiaLocationService = new IndiaLocationService();
