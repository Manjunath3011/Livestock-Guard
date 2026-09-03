/**
 * GIS Map Configuration
 * Central configuration for real geographic tile providers, attribution,
 * coordinate bounds, and fallback strategies for LivestockGuard.
 * 
 * Default configuration requires NO API key and uses official OpenStreetMap cartography.
 */

export interface MapTileProviderConfig {
  id: string;
  name: string;
  tileUrl: string;
  subdomains?: string[];
  attribution: string;
  maxZoom: number;
  minZoom?: number;
  requiresKey?: boolean;
  isDarkTheme?: boolean;
}

export const MAP_CONFIG = {
  // Center of India [latitude, longitude] - Note Leaflet ordering
  defaultCenter: [20.5937, 78.9629] as [number, number],
  defaultZoom: 5,
  minZoom: 3,
  maxZoom: 18,

  // Geographic bounds enclosing India [South-West [lat, lng], North-East [lat, lng]]
  indiaBounds: [
    [6.5, 68.1],
    [35.5, 97.4]
  ] as [[number, number], [number, number]],

  // Primary OpenStreetMap tile layer - 100% free, real geographic coverage of India, NO API key required
  defaultProvider: {
    id: 'osm_standard',
    name: 'OpenStreetMap Standard',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 3,
    requiresKey: false,
    isDarkTheme: false
  } as MapTileProviderConfig,

  // Alternative Open-Access Providers (No API key required)
  providers: [
    {
      id: 'osm_standard',
      name: 'OpenStreetMap (Standard)',
      tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
      requiresKey: false,
      isDarkTheme: false
    },
    {
      id: 'osm_hot',
      name: 'Humanitarian OSM',
      tileUrl: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">Humanitarian OpenStreetMap Team</a>',
      maxZoom: 19,
      minZoom: 3,
      requiresKey: false,
      isDarkTheme: false
    },
    {
      id: 'cyclosm',
      name: 'Terrain & Rural GIS',
      tileUrl: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://www.cyclosm.org" target="_blank" rel="noopener noreferrer">CyclOSM</a>',
      maxZoom: 18,
      minZoom: 3,
      requiresKey: false,
      isDarkTheme: false
    }
  ] as MapTileProviderConfig[],

  // Optional custom production provider (e.g. MapTiler, Stadia, Protomaps)
  // Activated only if environment variables are explicitly configured
  getCustomProvider: (): MapTileProviderConfig | null => {
    try {
      const metaEnv = (import.meta as any).env;
      const customUrl = metaEnv?.VITE_MAP_STYLE_URL;
      const token = metaEnv?.VITE_MAP_ACCESS_TOKEN;

      if (!customUrl || typeof customUrl !== 'string' || customUrl.trim() === '') {
        return null;
      }

      let finalUrl = customUrl;
      if (token && !finalUrl.includes('key=') && !finalUrl.includes('access_token=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}key=${encodeURIComponent(token)}`;
      }

      return {
        id: 'custom_provider',
        name: 'Custom GIS Provider',
        tileUrl: finalUrl,
        attribution: '&copy; Custom GIS Tile Provider',
        maxZoom: 19,
        minZoom: 3,
        requiresKey: !!token
      };
    } catch {
      return null;
    }
  }
};
