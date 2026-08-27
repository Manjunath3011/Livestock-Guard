export type StateType = 'STATE' | 'UT';

export type SubDistrictType = 'TALUKA' | 'BLOCK' | 'TEHSIL' | 'MANDAL' | 'SUB_DIVISION';

export interface LocalizedNames {
  hi?: string; // Hindi
  kn?: string; // Kannada
  te?: string; // Telugu
  mr?: string; // Marathi
  gu?: string; // Gujarati
  pa?: string; // Punjabi
  ta?: string; // Tamil
  bn?: string; // Bengali
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  capturedAt?: string;
  source?: 'GPS' | 'DEVICE_ASSISTED' | 'ADMIN_CENTROID' | 'MANUAL_ENTRY' | 'FARM_INHERITED';
}

export interface IndianState {
  id: string; // e.g. "st_in_mh"
  code: string; // e.g. "MH"
  lgdCode: number; // Local Government Directory Code (e.g. 27)
  name: string; // e.g. "Maharashtra"
  type: StateType;
  zone: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST' | 'ISLANDS';
  capital: string;
  localNames: LocalizedNames;
  centerCoordinates: GeoCoordinates;
  aliases?: string[];
  districtCount?: number;
}

export interface IndianDistrict {
  id: string; // e.g. "dt_in_mh_pune"
  stateId: string; // e.g. "st_in_mh"
  stateCode: string; // e.g. "MH"
  stateName: string; // e.g. "Maharashtra"
  lgdCode: number; // e.g. 488
  name: string; // e.g. "Pune"
  headquarters: string;
  localNames: LocalizedNames;
  centerCoordinates: GeoCoordinates;
  subDistrictCount?: number;
  aliases?: string[];
  livestockDensityCategory?: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  primarySpecies?: string[];
}

export interface IndianSubDistrict {
  id: string; // e.g. "sd_in_mh_pune_baramati"
  districtId: string; // e.g. "dt_in_mh_pune"
  stateId: string; // e.g. "st_in_mh"
  lgdCode: number;
  name: string; // e.g. "Baramati"
  type: SubDistrictType;
  localNames: LocalizedNames;
  centerCoordinates?: GeoCoordinates;
  aliases?: string[];
  headquarters?: string;
}

export interface IndianVillage {
  id: string; // e.g. "vl_in_mh_pune_baramati_malegaon_bk"
  subDistrictId: string;
  districtId: string;
  stateId: string;
  lgdCode?: number;
  name: string; // e.g. "Malegaon Budruk"
  gramPanchayat?: string;
  pincode: string; // e.g. "413115"
  coordinates: GeoCoordinates;
  localNames?: LocalizedNames;
  isCustom?: boolean;
  aliases?: string[];
  veterinaryDispensaryDistanceKm?: number;
}

export interface NormalizedLocationSelection {
  stateId: string;
  stateCode: string;
  stateName: string;
  districtId: string;
  districtName: string;
  subDistrictId: string;
  subDistrictName: string;
  villageId: string;
  villageName: string;
  gramPanchayat?: string;
  pincode: string;
  addressLine?: string;
  coordinates: GeoCoordinates;
  formattedAddress: string;
  isCustomVillage?: boolean;
}

export interface LocationSearchResult {
  id: string;
  name: string;
  type: 'VILLAGE' | 'SUB_DISTRICT' | 'DISTRICT' | 'STATE';
  hierarchyText: string;
  pincode?: string;
  stateName: string;
  districtName: string;
  subDistrictName?: string;
  villageName?: string;
  stateId: string;
  districtId: string;
  subDistrictId?: string;
  villageId?: string;
  coordinates: GeoCoordinates;
  localName?: string;
}
