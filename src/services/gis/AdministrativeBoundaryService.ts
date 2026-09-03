import { indiaLocationService } from '../IndiaLocationService';
import { GeoJSONFeatureCollection, GeoJSONPoint, GeoJSONPolygon } from '../../types/gis';

export interface AdministrativeNodeGeoProperties {
  id: string;
  name: string;
  level: 'STATE' | 'DISTRICT' | 'SUB_DISTRICT' | 'VILLAGE';
  code?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  pincode?: string;
  animalCensusSummary?: {
    totalLivestock?: number;
    predominantSpecies?: string[];
  };
}

export interface AdministrativeBoundaryProvider {
  getStatesGeoJSON(): GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties>;
  getDistrictsGeoJSON(stateId?: string): GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties>;
  getAdministrativeCentroid(id: string, level: 'STATE' | 'DISTRICT'): [number, number] | null;
}

/**
 * Administrative Boundary Service
 * Provides authoritative administrative hierarchy nodes (State -> District -> Sub-district -> Village)
 * backed by IndiaLocationService, with clean GeoJSON interfaces for plugging in future
 * boundary polygon shapefiles or remote GeoJSON services.
 */
export class AdministrativeBoundaryService implements AdministrativeBoundaryProvider {
  private static instance: AdministrativeBoundaryService;

  private constructor() {}

  public static getInstance(): AdministrativeBoundaryService {
    if (!AdministrativeBoundaryService.instance) {
      AdministrativeBoundaryService.instance = new AdministrativeBoundaryService();
    }
    return AdministrativeBoundaryService.instance;
  }

  /**
   * Get all Indian States and Union Territories as GeoJSON Points (centroids)
   */
  public getStatesGeoJSON(): GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties> {
    const states = indiaLocationService.getStates();
    const features: GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties>['features'] = [];

    states.forEach(s => {
      if (!s.centerCoordinates) return;
      features.push({
        type: 'Feature',
        id: `state_${s.id}`,
        geometry: {
          type: 'Point',
          coordinates: [s.centerCoordinates.longitude, s.centerCoordinates.latitude]
        },
        properties: {
          id: s.id,
          name: s.name,
          level: 'STATE',
          code: s.code
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Get Indian Districts as GeoJSON Points (centroids)
   */
  public getDistrictsGeoJSON(stateId?: string): GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties> {
    const districts = indiaLocationService.getDistricts(stateId);
    const features: GeoJSONFeatureCollection<GeoJSONPoint, AdministrativeNodeGeoProperties>['features'] = [];

    districts.forEach(d => {
      if (!d.centerCoordinates) return;
      features.push({
        type: 'Feature',
        id: `district_${d.id}`,
        geometry: {
          type: 'Point',
          coordinates: [d.centerCoordinates.longitude, d.centerCoordinates.latitude]
        },
        properties: {
          id: d.id,
          name: d.name,
          level: 'DISTRICT',
          code: d.stateCode,
          stateId: d.stateId,
          stateName: d.stateName
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Get centroid coordinates [lng, lat] for a state or district
   */
  public getAdministrativeCentroid(id: string, level: 'STATE' | 'DISTRICT'): [number, number] | null {
    if (level === 'STATE') {
      const s = indiaLocationService.getStateById(id);
      if (s?.centerCoordinates) {
        return [s.centerCoordinates.longitude, s.centerCoordinates.latitude];
      }
    } else if (level === 'DISTRICT') {
      const d = indiaLocationService.getDistrictById(id);
      if (d?.centerCoordinates) {
        return [d.centerCoordinates.longitude, d.centerCoordinates.latitude];
      }
    }
    return null;
  }
}

export const administrativeBoundaryService = AdministrativeBoundaryService.getInstance();
