import {
  Case,
  Outbreak,
  MortalityReport,
  Role,
  User
} from '../../types';
import {
  HotspotCluster,
  GeoJSONFeatureCollection,
  GeoJSONPoint,
  GeoJSONPolygon,
  CaseGeoProperties,
  HotspotGeoProperties,
  OutbreakGeoProperties,
  ContainmentZoneGeoProperties,
  FacilityGeoProperties
} from '../../types/gis';

/**
 * GIS Map Adapter
 * Converts LivestockGuard epidemiological domain entities (Cases, Hotspots,
 * Outbreaks, Infrastructure) into standard GeoJSON FeatureCollections for MapLibre.
 * 
 * STRICT MANDATE: All GeoJSON coordinates must be [longitude, latitude]
 */
export class GISMapAdapter {
  /**
   * Validate and normalize latitude and longitude coordinates
   */
  public static isValidCoordinate(lat: unknown, lng: unknown): boolean {
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (isNaN(numLat) || isNaN(numLng)) return false;
    if (numLat === 0 && numLng === 0) return false;
    return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
  }

  /**
   * Create a true geodesic circle polygon in kilometers on Earth's surface
   * Returns standard GeoJSON Polygon format: coordinates[0] is an array of [lng, lat]
   */
  public static createGeodesicCircle(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    numPoints = 64
  ): GeoJSONPolygon {
    const coordinates: [number, number][] = [];
    const dByR = Math.max(0.1, radiusKm) / 6371; // Angular distance in radians
    const latRad = (centerLat * Math.PI) / 180;
    const lngRad = (centerLng * Math.PI) / 180;

    for (let i = 0; i <= numPoints; i++) {
      const bearing = (i * 2 * Math.PI) / numPoints;
      const pLat = Math.asin(
        Math.sin(latRad) * Math.cos(dByR) +
        Math.cos(latRad) * Math.sin(dByR) * Math.cos(bearing)
      );
      const pLng =
        lngRad +
        Math.atan2(
          Math.sin(bearing) * Math.sin(dByR) * Math.cos(latRad),
          Math.cos(dByR) - Math.sin(latRad) * Math.sin(pLat)
        );

      // GeoJSON requires [longitude, latitude]
      coordinates.push([(pLng * 180) / Math.PI, (pLat * 180) / Math.PI]);
    }

    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }

  /**
   * Calculate epidemiological weight of a case for the GIS Heatmap layer
   */
  public static calculateHeatmapWeight(c: Case): number {
    if (c.credibilityStatus === 'REJECTED' || c.status === 'REJECTED') {
      return 0.0;
    }
    if (c.verificationState === 'LAB_CONFIRMED' || c.status === 'CONFIRMED') {
      return 1.0;
    }
    if (c.verificationState === 'VET_VERIFIED') {
      return 0.95;
    }
    if (c.verificationState === 'FIELD_VERIFIED') {
      return 0.85;
    }
    if (c.credibilityTier === 'TRUSTED' || (c.credibilityScore && c.credibilityScore >= 80)) {
      return 0.70;
    }
    if (c.credibilityTier === 'LOW_CREDIBILITY' || (c.credibilityScore && c.credibilityScore < 50)) {
      return 0.15;
    }
    return 0.40; // Needs verification default
  }

  /**
   * Determine the credibility/verification status group for visual styling
   */
  public static determineStatusGroup(c: Case): CaseGeoProperties['statusGroup'] {
    if (c.credibilityStatus === 'REJECTED' || c.status === 'REJECTED') {
      return 'REJECTED';
    }
    if (
      c.credibilityStatus === 'VERIFIED' ||
      c.verificationState === 'LAB_CONFIRMED' ||
      c.verificationState === 'VET_VERIFIED' ||
      c.verificationState === 'FIELD_VERIFIED'
    ) {
      return 'VERIFIED';
    }
    if (c.credibilityTier === 'LOW_CREDIBILITY' || (c.credibilityScore && c.credibilityScore < 50)) {
      return 'LOW_CREDIBILITY';
    }
    if (c.credibilityStatus === 'NEEDS_VERIFICATION' || c.isCriticalUrgentVerification) {
      return 'NEEDS_VERIFICATION';
    }
    return 'SUSPECTED';
  }

  /**
   * Convert Cases array to GeoJSON FeatureCollection of Points
   * Applies privacy masking for Farmer role and coordinate safety checks
   */
  public static casesToGeoJSON(
    cases: Case[],
    currentUser?: User | null
  ): GeoJSONFeatureCollection<GeoJSONPoint, CaseGeoProperties> {
    const isFarmer = currentUser?.role === 'FARMER';
    const features: GeoJSONFeatureCollection<GeoJSONPoint, CaseGeoProperties>['features'] = [];

    (cases || []).forEach(c => {
      if (!c) return;
      const lat = Number(c.latitude);
      const lng = Number(c.longitude);

      if (!this.isValidCoordinate(lat, lng)) {
        return; // Safely skip invalid coordinates
      }

      const diseaseName =
        c.suspectedDiseases?.[0]?.diseaseName || c.confirmedDiseaseId || 'Suspected Bovine Illness';
      const statusGroup = this.determineStatusGroup(c);
      const weight = this.calculateHeatmapWeight(c);

      const properties: CaseGeoProperties = {
        caseId: c.id,
        caseNumber: c.caseNumber || c.id,
        species: c.species || 'Cattle',
        disease: diseaseName,
        riskLevel: c.riskLevel || 'MODERATE',
        riskScore: c.riskScore || 50,
        status: c.status || 'NEW',
        statusGroup,
        credibilityScore: c.credibilityScore ?? 70,
        credibilityTier: c.credibilityTier || 'PROVISIONAL',
        credibilityStatus: c.credibilityStatus || 'NEEDS_VERIFICATION',
        verificationState: c.verificationState || 'PENDING_TRIAGE',
        isUrgentVerification: !!c.isCriticalUrgentVerification,
        affectedCount: c.affectedCount || 1,
        deadCount: c.deadCount || 0,
        villageName: c.villageName || 'Village Perimeter',
        districtName: c.districtName || 'Surveillance District',
        stateName: c.stateName || 'State',
        ownerName: isFarmer ? 'Farm Operator (Confidential)' : c.ownerName || 'Livestock Keeper',
        ownerPhone: isFarmer ? undefined : c.ownerPhone,
        reportDate: c.createdAt || c.symptomsStartDate || new Date().toISOString(),
        priority: c.priority || 'ROUTINE',
        weight
      };

      features.push({
        type: 'Feature',
        id: c.id,
        geometry: {
          type: 'Point',
          // GeoJSON ordering: [longitude, latitude]
          coordinates: [lng, lat]
        },
        properties
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Hotspots to centroid point features for markers/popups
   */
  public static hotspotsToCentroidsGeoJSON(
    hotspots: HotspotCluster[]
  ): GeoJSONFeatureCollection<GeoJSONPoint, HotspotGeoProperties> {
    const features: GeoJSONFeatureCollection<GeoJSONPoint, HotspotGeoProperties>['features'] = [];

    (hotspots || []).forEach(h => {
      if (!h || !this.isValidCoordinate(h.centerLat, h.centerLng)) return;

      const properties: HotspotGeoProperties = {
        hotspotId: h.id,
        name: h.name,
        riskTier: h.riskTier,
        riskScore: h.riskScore,
        primaryDisease: h.primaryDisease,
        classification: h.classification,
        totalCases: h.currentPeriodCaseCount || h.caseIds.length,
        verifiedReports: h.reportCredibilityCounts?.verifiedReports ?? 0,
        needsVerificationReports: h.reportCredibilityCounts?.needsVerificationReports ?? 0,
        lowCredibilityReports: h.reportCredibilityCounts?.lowCredibilityReports ?? 0,
        affectedCount: h.totalAffectedAnimals,
        deathCount: h.totalDeaths,
        trend: h.trend,
        radiusKm: h.radiusKm,
        hasOfficialOutbreak: h.hasOfficialOutbreak,
        hasPositiveLab: h.hasPositiveLab,
        isSimulatedDemo: h.isSimulatedDemo
      };

      features.push({
        type: 'Feature',
        id: h.id,
        geometry: {
          type: 'Point',
          coordinates: [h.centerLng, h.centerLat] // [lng, lat]
        },
        properties
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Hotspots to true geographic circle polygons
   */
  public static hotspotsToPolygonsGeoJSON(
    hotspots: HotspotCluster[]
  ): GeoJSONFeatureCollection<GeoJSONPolygon, HotspotGeoProperties> {
    const features: GeoJSONFeatureCollection<GeoJSONPolygon, HotspotGeoProperties>['features'] = [];

    (hotspots || []).forEach(h => {
      if (!h || !this.isValidCoordinate(h.centerLat, h.centerLng)) return;

      const polygon = this.createGeodesicCircle(h.centerLat, h.centerLng, h.radiusKm, 64);

      const properties: HotspotGeoProperties = {
        hotspotId: h.id,
        name: h.name,
        riskTier: h.riskTier,
        riskScore: h.riskScore,
        primaryDisease: h.primaryDisease,
        classification: h.classification,
        totalCases: h.currentPeriodCaseCount || h.caseIds.length,
        verifiedReports: h.reportCredibilityCounts?.verifiedReports ?? 0,
        needsVerificationReports: h.reportCredibilityCounts?.needsVerificationReports ?? 0,
        lowCredibilityReports: h.reportCredibilityCounts?.lowCredibilityReports ?? 0,
        affectedCount: h.totalAffectedAnimals,
        deathCount: h.totalDeaths,
        trend: h.trend,
        radiusKm: h.radiusKm,
        hasOfficialOutbreak: h.hasOfficialOutbreak,
        hasPositiveLab: h.hasPositiveLab,
        isSimulatedDemo: h.isSimulatedDemo
      };

      features.push({
        type: 'Feature',
        id: `poly_${h.id}`,
        geometry: polygon,
        properties
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Outbreaks to Epicenter Points
   */
  public static outbreaksToPointsGeoJSON(
    outbreaks: Outbreak[]
  ): GeoJSONFeatureCollection<GeoJSONPoint, OutbreakGeoProperties> {
    const features: GeoJSONFeatureCollection<GeoJSONPoint, OutbreakGeoProperties>['features'] = [];

    (outbreaks || []).forEach(o => {
      if (!o || !this.isValidCoordinate(o.latitude, o.longitude)) return;

      const properties: OutbreakGeoProperties = {
        outbreakId: o.id,
        outbreakCode: o.outbreakCode || o.id,
        diseaseName: o.diseaseName,
        status: o.status,
        riskLevel: o.riskLevel,
        radiusKm: o.radiusKm || 10,
        totalCases: o.totalCases || 0,
        totalDeaths: o.totalDeaths || 0,
        affectedAnimalCount: o.affectedAnimalCount || 0,
        startDate: o.startDate,
        districtName: o.districtName,
        primaryVillage: o.primaryVillage || o.villageName || 'Primary Sector',
        containmentMeasures: o.containmentMeasures || []
      };

      features.push({
        type: 'Feature',
        id: o.id,
        geometry: {
          type: 'Point',
          coordinates: [Number(o.longitude), Number(o.latitude)]
        },
        properties
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Outbreaks into Geographic Containment Rings (Core Zone & Surveillance Buffer Zone)
   */
  public static outbreaksToContainmentZonesGeoJSON(
    outbreaks: Outbreak[]
  ): GeoJSONFeatureCollection<GeoJSONPolygon, ContainmentZoneGeoProperties> {
    const features: GeoJSONFeatureCollection<GeoJSONPolygon, ContainmentZoneGeoProperties>['features'] = [];

    (outbreaks || []).forEach(o => {
      if (!o || !this.isValidCoordinate(o.latitude, o.longitude)) return;

      const lat = Number(o.latitude);
      const lng = Number(o.longitude);
      const coreRadius = Math.max(3, o.radiusKm || 5);
      const bufferRadius = coreRadius * 2; // e.g. 5km core, 10km surveillance ring

      // 1. Core Containment Zone (Red/Rose)
      const corePoly = this.createGeodesicCircle(lat, lng, coreRadius, 64);
      features.push({
        type: 'Feature',
        id: `core_${o.id}`,
        geometry: corePoly,
        properties: {
          zoneId: `core_${o.id}`,
          outbreakId: o.id,
          outbreakCode: o.outbreakCode || o.id,
          diseaseName: o.diseaseName,
          zoneType: 'CORE_CONTAINMENT',
          radiusKm: coreRadius,
          color: '#f43f5e',
          opacity: 0.25
        }
      });

      // 2. Surveillance Buffer Zone (Amber/Orange)
      const bufferPoly = this.createGeodesicCircle(lat, lng, bufferRadius, 64);
      features.push({
        type: 'Feature',
        id: `buf_${o.id}`,
        geometry: bufferPoly,
        properties: {
          zoneId: `buf_${o.id}`,
          outbreakId: o.id,
          outbreakCode: o.outbreakCode || o.id,
          diseaseName: o.diseaseName,
          zoneType: 'SURVEILLANCE_BUFFER',
          radiusKm: bufferRadius,
          color: '#f59e0b',
          opacity: 0.12
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Veterinary & Diagnostic Facilities to GeoJSON
   * Explicitly demarcates verified vs seeded demo records
   */
  public static facilitiesToGeoJSON(
    facilities: Array<{
      id: string;
      name: string;
      type: 'VET' | 'LAB' | 'VET_CENTER' | 'DIAGNOSTIC_LAB';
      lat: number;
      lng: number;
      district?: string;
      state?: string;
      isVerified?: boolean;
    }>
  ): GeoJSONFeatureCollection<GeoJSONPoint, FacilityGeoProperties> {
    const features: GeoJSONFeatureCollection<GeoJSONPoint, FacilityGeoProperties>['features'] = [];

    (facilities || []).forEach(f => {
      if (!f || !this.isValidCoordinate(f.lat, f.lng)) return;

      const normType: FacilityGeoProperties['type'] =
        f.type === 'LAB' || f.type === 'DIAGNOSTIC_LAB' ? 'DIAGNOSTIC_LAB' : 'VET_CENTER';

      const isVerified = f.isVerified ?? false;

      features.push({
        type: 'Feature',
        id: f.id,
        geometry: {
          type: 'Point',
          coordinates: [Number(f.lng), Number(f.lat)]
        },
        properties: {
          id: f.id,
          name: f.name,
          type: normType,
          district: f.district || 'District Facility',
          state: f.state,
          isVerifiedInfrastructure: isVerified,
          dataSource: isVerified ? 'OFFICIAL_INFRASTRUCTURE' : 'DEMO_SEEDED'
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Convert Mortality Reports to GeoJSON Points
   */
  public static mortalitiesToGeoJSON(
    mortalities: MortalityReport[]
  ): GeoJSONFeatureCollection<GeoJSONPoint, Record<string, any>> {
    const features: GeoJSONFeatureCollection<GeoJSONPoint, Record<string, any>>['features'] = [];

    (mortalities || []).forEach(m => {
      if (!m || !this.isValidCoordinate(m.latitude, m.longitude)) return;

      features.push({
        type: 'Feature',
        id: m.id,
        geometry: {
          type: 'Point',
          coordinates: [Number(m.longitude), Number(m.latitude)]
        },
        properties: {
          id: m.id,
          reportCode: m.reportCode,
          species: m.species,
          deadCount: m.deadCount,
          affectedCount: m.affectedCount,
          cause: m.suspectedCause,
          villageName: m.villageName,
          districtName: m.districtName,
          dateOfDeath: m.dateOfDeath
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }
}
