import L from 'leaflet';
import { GISMapStyleId, GISMapStylePreset } from '../../types/gis';
import { MAP_CONFIG } from '../../config/mapConfig';

export interface LeafletTileLayerSpec {
  url: string;
  options: L.TileLayerOptions;
}

/**
 * GIS Map Service
 * Manages map styles, open-access tile configurations, and coordinate references
 * for LivestockGuard geospatial intelligence using Leaflet and OpenStreetMap.
 * 
 * GUARANTEE: Default configuration requires NO API key and renders real India geography.
 */
export class GISMapService {
  // Center of India [lat, lng] for Leaflet
  public static readonly DEFAULT_CENTER_LEAFLET: [number, number] = [20.5937, 78.9629];
  // Center of India [lng, lat] for standard GeoJSON
  public static readonly DEFAULT_CENTER_GEOJSON: [number, number] = [78.9629, 20.5937];

  // Default zoom level focusing on the entire Indian subcontinent
  public static readonly DEFAULT_ZOOM = 5;

  // Geographic bounds enclosing India [[south, west], [north, east]]
  public static readonly INDIA_BOUNDS_LEAFLET: [[number, number], [number, number]] = [
    [6.5, 68.1],
    [35.5, 97.4]
  ];

  /**
   * Available map style presets - All default presets use verified open-access tiles requiring NO key
   */
  public static readonly STYLE_PRESETS: GISMapStylePreset[] = [
    {
      id: 'osm_standard',
      label: 'OpenStreetMap (Standard)',
      description: 'Official global geographic street, boundary, and village cartography without API keys'
    },
    {
      id: 'osm_hot',
      label: 'Humanitarian OSM',
      description: 'High-contrast community cartography optimized for humanitarian and field operations'
    },
    {
      id: 'cyclosm',
      label: 'Terrain & Rural Topography',
      description: 'Topographic contour and rural infrastructure map suitable for livestock grazing corridors'
    }
  ];

  /**
   * Retrieve configured custom style URL if provided via environment
   */
  public static getCustomStyleUrl(): string | null {
    const custom = MAP_CONFIG.getCustomProvider();
    return custom ? custom.tileUrl : null;
  }

  /**
   * Generate Leaflet TileLayer configuration for the selected style ID.
   * Gracefully falls back to OpenStreetMap Standard if any custom provider is unconfigured.
   */
  public static getLeafletTileConfig(styleId: GISMapStyleId): LeafletTileLayerSpec {
    // Custom provider if configured
    if (styleId === 'custom') {
      const custom = MAP_CONFIG.getCustomProvider();
      if (custom) {
        return {
          url: custom.tileUrl,
          options: {
            attribution: custom.attribution,
            maxZoom: custom.maxZoom,
            minZoom: custom.minZoom || 3,
            crossOrigin: true
          }
        };
      }
    }

    if (styleId === 'osm_hot') {
      return {
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">Humanitarian OpenStreetMap Team</a>',
          maxZoom: 19,
          minZoom: 3,
          subdomains: ['a', 'b', 'c'],
          crossOrigin: true
        }
      };
    }

    if (styleId === 'cyclosm') {
      return {
        url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://www.cyclosm.org" target="_blank" rel="noopener noreferrer">CyclOSM</a>',
          maxZoom: 18,
          minZoom: 3,
          subdomains: ['a', 'b', 'c'],
          crossOrigin: true
        }
      };
    }

    // Default & Fallback for 'osm_standard', 'surveillance_dark', 'carto_light':
    // Always use official OpenStreetMap tiles with NO key required
    return {
      url: MAP_CONFIG.defaultProvider.tileUrl,
      options: {
        attribution: MAP_CONFIG.defaultProvider.attribution,
        maxZoom: MAP_CONFIG.defaultProvider.maxZoom,
        minZoom: MAP_CONFIG.defaultProvider.minZoom || 3,
        crossOrigin: true
      }
    };
  }
}
