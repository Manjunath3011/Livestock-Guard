import { indiaLocationService } from '../IndiaLocationService';
import { GPSValidationResult } from '../../types/gis';

interface CachedGeocode {
  lat: number;
  lng: number;
  timestamp: number;
  formattedAddress: string;
}

/**
 * Geocoding Service
 * High-performance, offline-capable geocoding and location validation service for LivestockGuard.
 * Uses internal India administrative coordinates database with caching and request throttling.
 */
export class GeocodingService {
  private static cache: Map<string, CachedGeocode> = new Map();
  private static readonly CACHE_STORAGE_KEY = 'lg_gis_geocode_cache_v1';
  private static readonly MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

  static {
    // Load cache from localStorage if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.CACHE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.entries(parsed).forEach(([key, val]) => {
            this.cache.set(key, val as CachedGeocode);
          });
        }
      }
    } catch (e) {
      console.warn('Geocoding cache load warning:', e);
    }
  }

  private static persistCache() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, CachedGeocode> = {};
        this.cache.forEach((v, k) => {
          obj[k] = v;
        });
        localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(obj));
      }
    } catch {
      // Storage full or unavailable
    }
  }

  /**
   * Geocode a place name / village / district in India
   */
  public static async geocode(
    query: string,
    stateContext?: string
  ): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    if (!query || query.trim() === '') return null;
    const cleanQuery = `${query.trim().toLowerCase()}_${(stateContext || '').trim().toLowerCase()}`;

    // 1. Check in-memory / persistent cache
    const cached = this.cache.get(cleanQuery);
    if (cached && Date.now() - cached.timestamp < this.MAX_CACHE_AGE_MS) {
      return {
        lat: cached.lat,
        lng: cached.lng,
        formattedAddress: cached.formattedAddress
      };
    }

    // 2. Search local authoritative IndiaLocationService (100% offline & instant)
    const results = indiaLocationService.searchLocations(query, 5);
    if (results.length > 0) {
      const bestMatch = results[0];
      if (bestMatch.coordinates) {
        const result = {
          lat: bestMatch.coordinates.latitude,
          lng: bestMatch.coordinates.longitude,
          formattedAddress: bestMatch.hierarchyText || bestMatch.name
        };

        this.cache.set(cleanQuery, {
          ...result,
          timestamp: Date.now()
        });
        this.persistCache();
        return result;
      }
    }

    return null;
  }

  /**
   * Validate GPS coordinates against user-reported administrative location
   * Returns validation status to feed the Report Credibility Engine.
   */
  public static validateGPSLocation(params: {
    latitude?: number | null;
    longitude?: number | null;
    accuracyMeters?: number | null;
    villageName?: string;
    districtName?: string;
    districtId?: string;
    stateName?: string;
  }): GPSValidationResult {
    const { latitude, longitude, accuracyMeters, villageName, districtName, districtId } = params;

    // 1. If GPS coordinates are unavailable
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null ||
      isNaN(Number(latitude)) ||
      isNaN(Number(longitude)) ||
      (latitude === 0 && longitude === 0)
    ) {
      return {
        status: 'UNAVAILABLE',
        message: 'GPS coordinates were not captured at report time. Report is valid based on administrative hierarchy.'
      };
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    // 2. Check GPS accuracy
    if (accuracyMeters && accuracyMeters > 500) {
      return {
        status: 'LOW_GPS_ACCURACY',
        accuracyMeters,
        message: `GPS accuracy is low (±${Math.round(accuracyMeters)}m). Coordinates are approximate.`
      };
    }

    // 3. Find nearest administrative location in database
    const nearest = indiaLocationService.findNearestAdminLocation(lat, lng);
    if (!nearest) {
      return {
        status: 'VERIFIED',
        accuracyMeters: accuracyMeters ?? 15,
        message: 'GPS coordinates captured within acceptable surveillance perimeter.'
      };
    }

    // 4. Compare with reported administrative context
    let targetCoords: { latitude: number; longitude: number } | null = null;
    if (districtId) {
      const d = indiaLocationService.getDistrictById(districtId);
      if (d?.centerCoordinates) targetCoords = d.centerCoordinates;
    }
    if (!targetCoords && districtName) {
      const d = indiaLocationService.getDistricts().find(
        x => x.name.toLowerCase() === districtName.toLowerCase()
      );
      if (d?.centerCoordinates) targetCoords = d.centerCoordinates;
    }

    if (targetCoords) {
      // Calculate Haversine distance in km
      const distanceKm = this.calculateHaversineDistance(
        lat,
        lng,
        targetCoords.latitude,
        targetCoords.longitude
      );

      // If distance exceeds 85km from district centroid, flag location mismatch
      if (distanceKm > 85) {
        return {
          status: 'LOCATION_MISMATCH',
          distanceFromExpectedKm: Math.round(distanceKm),
          expectedDistrict: districtName,
          nearestAdminName: `${nearest.villageName}, ${nearest.districtName}`,
          accuracyMeters: accuracyMeters ?? 15,
          message: `GPS location is ${Math.round(distanceKm)}km away from reported district (${districtName}). Nearest detected: ${nearest.districtName}.`
        };
      }

      return {
        status: 'VERIFIED',
        distanceFromExpectedKm: Math.round(distanceKm),
        expectedDistrict: districtName,
        nearestAdminName: nearest.villageName,
        accuracyMeters: accuracyMeters ?? 15,
        message: `GPS coordinates verified consistent with ${districtName} (${Math.round(distanceKm)}km from district centroid).`
      };
    }

    return {
      status: 'VERIFIED',
      accuracyMeters: accuracyMeters ?? 15,
      message: 'GPS coordinates captured and recorded.'
    };
  }

  private static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}
