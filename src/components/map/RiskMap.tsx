import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Case,
  Outbreak,
  MortalityReport,
  LabSample,
  Species,
  RiskLevel,
  User
} from '../../types';
import {
  HotspotCluster,
  HotspotRiskTier,
  SurveillanceTimeWindow,
  GISLayerVisibility,
  GISMapStyleId
} from '../../types/gis';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Building,
  FlaskConical,
  X,
  Clock,
  Flame,
  Sparkles,
  Play,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Compass,
  Check
} from 'lucide-react';
import { MAP_CONFIG } from '../../config/mapConfig';
import { GISMapService } from '../../services/gis/GISMapService';
import { GISMapAdapter } from '../../services/gis/GISMapAdapter';
import { GISHotspotEngine } from '../../services/GISHotspotEngine';
import { createHeatmapLayer } from '../../services/gis/LeafletHeatHelper';
import { HotspotDetailsPanel } from './HotspotDetailsPanel';
import { store } from '../../services/store';

// Fix default Leaflet icon paths if standard icons are referenced
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: ''
});

interface RiskMapProps {
  cases?: Case[];
  outbreaks?: Outbreak[];
  mortalities?: MortalityReport[];
  labSamples?: LabSample[];
  currentUser?: User | null;
  selectedCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  height?: string;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  cases = [],
  outbreaks = [],
  mortalities = [],
  labSamples = [],
  currentUser,
  selectedCaseId,
  onSelectCase,
  height = 'h-[620px]'
}) => {
  const activeUser = currentUser || store.getCurrentUser();
  const isFarmer = activeUser?.role === 'FARMER';

  // Map DOM container & Leaflet instance refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Leaflet Layer Groups for high-performance updates
  const containmentZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotRingsLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const casesLayerRef = useRef<L.LayerGroup | null>(null);
  const mortalitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const userGpsLayerRef = useRef<L.LayerGroup | null>(null);

  // Map state
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useFallbackMode, setUseFallbackMode] = useState<boolean>(false);
  const [currentMapStyle, setCurrentMapStyle] = useState<GISMapStyleId>('osm_standard');
  const [showLayerDrawer, setShowLayerDrawer] = useState<boolean>(false);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);

  // Network & Sync status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [, setLastRefreshedAt] = useState<Date>(new Date());

  // GPS User Location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Surveillance Filters
  const [timeWindow, setTimeWindow] = useState<SurveillanceTimeWindow>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [demoScenario, setDemoScenario] = useState<'LIVE' | 'fmd_surge' | 'ppr_cluster' | 'lsd_vector'>('LIVE');

  // Comprehensive GIS Layer Visibility
  const [layerVisibility, setLayerVisibility] = useState<GISLayerVisibility>({
    cases: true,
    verifiedCases: true,
    needsVerificationCases: true,
    lowCredibilityCases: true,
    rejectedCases: false, // Rejected reports hidden from active surveillance map by default
    hotspots: true,
    outbreaks: true,
    containmentRings: true,
    vetCenters: true,
    diagnosticLabs: true,
    heatmap: true,
    adminBoundaries: false
  });

  // Selected item modal & Hotspot inspection
  const [activeItem, setActiveItem] = useState<{
    type: 'CASE' | 'OUTBREAK' | 'MORTALITY' | 'LAB' | 'VET';
    data: any;
  } | null>(null);

  const [activeHotspot, setActiveHotspot] = useState<HotspotCluster | null>(null);

  // Verified & Seeded Reference points for Infrastructure
  const staticInfrastructure = useMemo(
    () => [
      {
        id: 'vet_baramati',
        name: 'Baramati Veterinary Polyclinic & Hospital',
        type: 'VET' as const,
        lat: 18.158,
        lng: 74.572,
        district: 'Pune',
        state: 'Maharashtra',
        isVerified: true
      },
      {
        id: 'vet_karad',
        name: 'Karad Taluka Veterinary Dispensary',
        type: 'VET' as const,
        lat: 17.291,
        lng: 74.185,
        district: 'Satara',
        state: 'Maharashtra',
        isVerified: true
      },
      {
        id: 'vet_chikodi',
        name: 'Chikodi Veterinary Hospital',
        type: 'VET' as const,
        lat: 16.402,
        lng: 74.385,
        district: 'Belagavi',
        state: 'Karnataka',
        isVerified: true
      },
      {
        id: 'lab_pune',
        name: 'Pune District Disease Investigation Lab (DIAL)',
        type: 'LAB' as const,
        lat: 18.52,
        lng: 73.856,
        district: 'Pune',
        state: 'Maharashtra',
        isVerified: true
      },
      {
        id: 'lab_anand',
        name: 'Anand Veterinary College Diagnostic Core Lab',
        type: 'LAB' as const,
        lat: 22.564,
        lng: 72.928,
        district: 'Anand',
        state: 'Gujarat',
        isVerified: true
      }
    ],
    []
  );

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Active dataset (Live vs Demo Simulation)
  const demoScenarios = useMemo(() => GISHotspotEngine.getDemoScenarios(), []);

  const activeDataset = useMemo(() => {
    if (demoScenario === 'LIVE') {
      return {
        cases: cases || [],
        outbreaks: outbreaks || [],
        isDemo: false,
        scenarioName: undefined
      };
    }
    const scenario = demoScenarios[demoScenario];
    if (scenario) {
      return {
        cases: scenario.cases,
        outbreaks: scenario.outbreaks,
        isDemo: true,
        scenarioName: scenario.name
      };
    }
    return {
      cases: cases || [],
      outbreaks: outbreaks || [],
      isDemo: false,
      scenarioName: undefined
    };
  }, [demoScenario, cases, outbreaks, demoScenarios]);

  // Filtered cases by Time, Species, and Risk
  const filteredCases = useMemo(() => {
    const { current: timeFiltered } = GISHotspotEngine.filterByTimeWindow(
      activeDataset.cases,
      timeWindow
    );

    return timeFiltered.filter(c => {
      if (!c) return false;
      if (speciesFilter !== 'ALL' && c.species !== speciesFilter) return false;
      if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [activeDataset.cases, timeWindow, speciesFilter, riskFilter]);

  // Detected Dynamic Hotspots via GIS Engine
  const detectedHotspots = useMemo(() => {
    const clusters = GISHotspotEngine.detectHotspots({
      cases: activeDataset.cases,
      outbreaks: activeDataset.outbreaks,
      mortalities: mortalities || [],
      labSamples: labSamples || [],
      timeWindow,
      speciesFilter,
      riskFilter,
      currentUser: activeUser
    });

    if (activeDataset.isDemo) {
      return clusters.map(cl => ({
        ...cl,
        isSimulatedDemo: true,
        simulatedScenarioName: activeDataset.scenarioName
      }));
    }

    return clusters;
  }, [
    activeDataset,
    mortalities,
    labSamples,
    timeWindow,
    speciesFilter,
    riskFilter,
    activeUser
  ]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (useFallbackMode || !mapContainerRef.current) return;

    // Destroy existing map if already present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Create Leaflet map targeting India
      const map = L.map(mapContainerRef.current, {
        center: GISMapService.DEFAULT_CENTER_LEAFLET,
        zoom: GISMapService.DEFAULT_ZOOM,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: false, // Custom UI buttons
        attributionControl: false
      });

      // Add OpenStreetMap attribution visible in bottom-right
      L.control
        .attribution({
          position: 'bottomright',
          prefix: false
        })
        .addAttribution(
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        )
        .addTo(map);

      // Initialize base tile layer using open-access OpenStreetMap tiles (NO API KEY REQUIRED)
      const tileConfig = GISMapService.getLeafletTileConfig(currentMapStyle);
      const tileLayer = L.tileLayer(tileConfig.url, {
        ...tileConfig.options,
        // Graceful error fallback to default OpenStreetMap if any tile server drops
        errorTileUrl: MAP_CONFIG.defaultProvider.tileUrl
      });
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Initialize dedicated LayerGroups
      containmentZonesLayerRef.current = L.layerGroup().addTo(map);
      hotspotRingsLayerRef.current = L.layerGroup().addTo(map);
      hotspotMarkersLayerRef.current = L.layerGroup().addTo(map);
      casesLayerRef.current = L.layerGroup().addTo(map);
      mortalitiesLayerRef.current = L.layerGroup().addTo(map);
      facilitiesLayerRef.current = L.layerGroup().addTo(map);
      userGpsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
      setMapError(null);

      // Resize observer to handle drawer toggles and responsive layouts
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Failed to initialize Leaflet GIS map:', err);
      setMapError('Real GIS map service encountered an initialization issue. Switched to fallback mode.');
      setUseFallbackMode(true);
    }
  }, [useFallbackMode]);

  // Update Base Tile Layer when Map Style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || useFallbackMode) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = GISMapService.getLeafletTileConfig(currentMapStyle);
    const newTileLayer = L.tileLayer(tileConfig.url, {
      ...tileConfig.options,
      errorTileUrl: MAP_CONFIG.defaultProvider.tileUrl
    });
    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [currentMapStyle, mapLoaded, useFallbackMode]);

  // Render Containment Rings & Outbreak Epicenters (Real geographic circles in meters)
  useEffect(() => {
    const group = containmentZonesLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (!layerVisibility.containmentRings && !layerVisibility.outbreaks) return;

    (activeDataset.outbreaks || []).forEach(o => {
      const lat = Number(o.latitude);
      const lng = Number(o.longitude);
      if (!GISMapAdapter.isValidCoordinate(lat, lng)) return;

      const radiusKm = o.radiusKm || 5;

      // 1. Core Containment Zone (Red ring)
      if (layerVisibility.containmentRings) {
        const coreCircle = L.circle([lat, lng], {
          radius: radiusKm * 1000, // Leaflet radius in meters
          color: '#ef4444',
          weight: 2,
          dashArray: '3, 3',
          fillColor: '#ef4444',
          fillOpacity: 0.16
        });
        coreCircle.on('click', e => {
          L.DomEvent.stopPropagation(e);
          setActiveItem({ type: 'OUTBREAK', data: o });
          setActiveHotspot(null);
        });
        group.addLayer(coreCircle);

        // 2. Surveillance Buffer Zone (Orange ring, +5km)
        const bufferCircle = L.circle([lat, lng], {
          radius: (radiusKm + 5) * 1000,
          color: '#f97316',
          weight: 1.5,
          dashArray: '5, 4',
          fillColor: '#f97316',
          fillOpacity: 0.08
        });
        bufferCircle.on('click', e => {
          L.DomEvent.stopPropagation(e);
          setActiveItem({ type: 'OUTBREAK', data: o });
          setActiveHotspot(null);
        });
        group.addLayer(bufferCircle);
      }

      // 3. Outbreak Epicenter Marker
      if (layerVisibility.outbreaks) {
        const outbreakHtml = `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform">
            <div class="absolute w-8 h-8 rounded-full bg-rose-600/40 animate-ping"></div>
            <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white text-white font-bold flex items-center justify-center text-xs shadow-2xl">
              ☣
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'leaflet-div-icon',
          html: outbreakHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon });
        marker.on('click', e => {
          L.DomEvent.stopPropagation(e);
          setActiveItem({ type: 'OUTBREAK', data: o });
          setActiveHotspot(null);
        });
        group.addLayer(marker);
      }
    });
  }, [activeDataset.outbreaks, layerVisibility.containmentRings, layerVisibility.outbreaks]);

  // Render Hotspot Risk Zones & Centroid Badges (True geographic circles)
  useEffect(() => {
    const ringsGroup = hotspotRingsLayerRef.current;
    const markersGroup = hotspotMarkersLayerRef.current;
    if (!ringsGroup || !markersGroup) return;

    ringsGroup.clearLayers();
    markersGroup.clearLayers();

    if (!layerVisibility.hotspots) return;

    detectedHotspots.forEach(h => {
      const lat = Number(h.centerLat);
      const lng = Number(h.centerLng);
      if (!GISMapAdapter.isValidCoordinate(lat, lng)) return;

      const tierColor =
        h.riskTier === 'CRITICAL'
          ? '#ef4444'
          : h.riskTier === 'HIGH'
          ? '#f97316'
          : h.riskTier === 'MODERATE'
          ? '#eab308'
          : '#22c55e';

      // 1. Geographic Hotspot Influence Circle (scales accurately with map zoom)
      const radiusMeters = Math.max(1000, (h.radiusKm || 10) * 1000);
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: tierColor,
        weight: 2,
        dashArray: '4, 4',
        fillColor: tierColor,
        fillOpacity: 0.16
      });

      circle.on('click', e => {
        L.DomEvent.stopPropagation(e);
        setActiveHotspot(h);
        setActiveItem(null);
      });
      ringsGroup.addLayer(circle);

      // 2. Hotspot Centroid Badge
      const tierBadgeStyle =
        h.riskTier === 'CRITICAL'
          ? 'border-red-500 bg-red-950/90 text-red-300'
          : h.riskTier === 'HIGH'
          ? 'border-orange-500 bg-orange-950/90 text-orange-300'
          : h.riskTier === 'MODERATE'
          ? 'border-amber-500 bg-amber-950/90 text-amber-300'
          : 'border-emerald-500 bg-emerald-950/90 text-emerald-300';

      const hotspotHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer select-none">
          <div class="absolute w-10 h-10 rounded-full ${
            h.riskTier === 'CRITICAL' ? 'bg-red-500/30 animate-ping' : 'bg-amber-500/20'
          }"></div>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full border-2 text-[10px] font-bold shadow-xl backdrop-blur-sm ${tierBadgeStyle} hover:scale-110 transition-transform whitespace-nowrap">
            <span>🔥</span>
            <span>${h.name.split('(')[0].trim()}</span>
            <span class="bg-black/40 px-1 rounded text-[9px]">${h.riskScore}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'leaflet-div-icon',
        html: hotspotHtml,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const marker = L.marker([lat, lng], { icon });
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        setActiveHotspot(h);
        setActiveItem(null);
      });
      markersGroup.addLayer(marker);
    });
  }, [detectedHotspots, layerVisibility.hotspots]);

  // Render Disease Case Markers
  useEffect(() => {
    const group = casesLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (!layerVisibility.cases) return;

    filteredCases.forEach(c => {
      const lat = Number(c.latitude);
      const lng = Number(c.longitude);
      if (!GISMapAdapter.isValidCoordinate(lat, lng)) return;

      const statusGroup = GISMapAdapter.determineStatusGroup(c);

      // Filter out individual categories if toggled off
      if (statusGroup === 'VERIFIED' && !layerVisibility.verifiedCases) return;
      if (statusGroup === 'NEEDS_VERIFICATION' && !layerVisibility.needsVerificationCases) return;
      if (statusGroup === 'LOW_CREDIBILITY' && !layerVisibility.lowCredibilityCases) return;
      if (statusGroup === 'REJECTED' && !layerVisibility.rejectedCases) return;

      const isSelected = selectedCaseId === c.id;

      // Visual styling matching credibility & clinical risk
      let pinBg = 'bg-emerald-500';
      let pinBorder = 'border-white';
      let glowHtml = '';
      let opacity = 'opacity-100';
      let sizeClass = 'w-6 h-6 text-[10px]';

      if (statusGroup === 'REJECTED') {
        pinBg = 'bg-slate-700';
        pinBorder = 'border-slate-500';
        opacity = 'opacity-40';
        sizeClass = 'w-4 h-4 text-[8px]';
      } else if (statusGroup === 'LOW_CREDIBILITY') {
        pinBg = 'bg-amber-700/80';
        pinBorder = 'border-amber-400/60';
        opacity = 'opacity-70';
        sizeClass = 'w-5 h-5 text-[9px]';
      } else if (statusGroup === 'NEEDS_VERIFICATION') {
        pinBg = c.riskLevel === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500';
        pinBorder = 'border-amber-300 ring-2 ring-amber-400/50';
        glowHtml = '<div class="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-pulse"></div>';
      } else if (statusGroup === 'VERIFIED') {
        pinBg =
          c.riskLevel === 'CRITICAL'
            ? 'bg-rose-600'
            : c.riskLevel === 'HIGH'
            ? 'bg-orange-500'
            : c.riskLevel === 'MODERATE'
            ? 'bg-amber-500'
            : 'bg-emerald-500';
        pinBorder = 'border-white ring-2 ring-emerald-400/80';
        if (c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH') {
          glowHtml = `<div class="absolute w-8 h-8 rounded-full ${
            c.riskLevel === 'CRITICAL' ? 'bg-rose-500/40 animate-ping' : 'bg-orange-500/30'
          }"></div>`;
        }
      }

      const diseaseLabel =
        c.suspectedDiseases?.[0]?.diseaseName || c.confirmedDiseaseId || 'Suspected Illness';

      const markerHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer select-none ${opacity}">
          ${glowHtml}
          <div class="${sizeClass} rounded-full border-2 shadow-xl flex items-center justify-center font-bold text-white transition-transform ${pinBg} ${pinBorder} ${
        isSelected ? 'scale-150 ring-4 ring-emerald-300' : 'hover:scale-125'
      }">
            ${c.affectedCount || 1}
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-200 px-2 py-1 rounded border border-slate-700 text-[10px] font-medium whitespace-nowrap shadow-xl z-50 pointer-events-none">
            <p class="font-bold text-white">${diseaseLabel}</p>
            <p class="text-slate-400">${c.villageName} • ${c.species} (${statusGroup})</p>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'leaflet-div-icon',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon });
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        setActiveItem({ type: 'CASE', data: c });
        setActiveHotspot(null);
        if (onSelectCase) onSelectCase(c.id);
      });
      group.addLayer(marker);
    });
  }, [
    filteredCases,
    layerVisibility.cases,
    layerVisibility.verifiedCases,
    layerVisibility.needsVerificationCases,
    layerVisibility.lowCredibilityCases,
    layerVisibility.rejectedCases,
    selectedCaseId,
    onSelectCase
  ]);

  // Render Mortalities
  useEffect(() => {
    const group = mortalitiesLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (!layerVisibility.cases || mortalities.length === 0) return;

    mortalities.forEach(m => {
      const lat = Number(m.latitude);
      const lng = Number(m.longitude);
      if (!GISMapAdapter.isValidCoordinate(lat, lng)) return;

      const mortalityHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform">
          <div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-red-600 text-red-500 font-bold flex items-center justify-center text-xs shadow-lg">
            ☠
          </div>
          <span class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            ${m.deadCount}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        className: 'leaflet-div-icon',
        html: mortalityHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon });
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        setActiveItem({ type: 'MORTALITY', data: m });
        setActiveHotspot(null);
      });
      group.addLayer(marker);
    });
  }, [mortalities, layerVisibility.cases]);

  // Render Veterinary Facilities and Diagnostic Labs
  useEffect(() => {
    const group = facilitiesLayerRef.current;
    if (!group) return;

    group.clearLayers();

    // 1. Vet Centers
    if (layerVisibility.vetCenters) {
      staticInfrastructure
        .filter(f => f.type === 'VET')
        .forEach(v => {
          const vetHtml = `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform">
              <div class="w-6 h-6 rounded-full bg-blue-950 border-2 border-blue-400 text-blue-300 flex items-center justify-center text-xs shadow-lg">
                🏥
              </div>
            </div>
          `;

          const icon = L.divIcon({
            className: 'leaflet-div-icon',
            html: vetHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([v.lat, v.lng], { icon });
          marker.on('click', e => {
            L.DomEvent.stopPropagation(e);
            setActiveItem({ type: 'VET', data: v });
            setActiveHotspot(null);
          });
          group.addLayer(marker);
        });
    }

    // 2. Diagnostic Labs
    if (layerVisibility.diagnosticLabs) {
      staticInfrastructure
        .filter(f => f.type === 'LAB')
        .forEach(lab => {
          const labHtml = `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform">
              <div class="w-6 h-6 rounded-full bg-purple-950 border-2 border-purple-400 text-purple-300 flex items-center justify-center text-xs shadow-lg">
                🧪
              </div>
            </div>
          `;

          const icon = L.divIcon({
            className: 'leaflet-div-icon',
            html: labHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([lab.lat, lab.lng], { icon });
          marker.on('click', e => {
            L.DomEvent.stopPropagation(e);
            setActiveItem({ type: 'LAB', data: lab });
            setActiveHotspot(null);
          });
          group.addLayer(marker);
        });
    }
  }, [staticInfrastructure, layerVisibility.vetCenters, layerVisibility.diagnosticLabs]);

  // Render Real Geographic Disease Heatmap (Weighted by Clinical Credibility)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || useFallbackMode) return;

    // Remove previous heatmap
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (!layerVisibility.heatmap) return;

    let isMounted = true;

    const prepareHeatmap = async () => {
      const points: [number, number, number][] = [];

      filteredCases.forEach(c => {
        // REJECTED reports NEVER contribute to active outbreak heatmaps
        if (c.credibilityStatus === 'REJECTED' || c.status === 'REJECTED') return;

        const lat = Number(c.latitude);
        const lng = Number(c.longitude);
        if (!GISMapAdapter.isValidCoordinate(lat, lng)) return;

        const weight = GISMapAdapter.calculateHeatmapWeight(c);
        points.push([lat, lng, weight]);
      });

      if (points.length === 0) return;

      const layer = await createHeatmapLayer(points);
      if (layer && isMounted && mapInstanceRef.current) {
        layer.addTo(mapInstanceRef.current);
        heatmapLayerRef.current = layer;
      }
    };

    prepareHeatmap();

    return () => {
      isMounted = false;
      if (heatmapLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    };
  }, [filteredCases, layerVisibility.heatmap, mapLoaded, useFallbackMode]);

  // Handle GPS "Use My Location"
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 11, { duration: 1.2 });

          // Update GPS indicator marker
          const group = userGpsLayerRef.current;
          if (group) {
            group.clearLayers();
            const gpsHtml = `
              <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none">
                <div class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></div>
                <div class="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-xl"></div>
              </div>
            `;
            const icon = L.divIcon({
              className: 'leaflet-div-icon',
              html: gpsHtml,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            const marker = L.marker([latitude, longitude], { icon });
            group.addLayer(marker);
          }
        }
      },
      err => {
        setIsLocating(false);
        let msg = 'Unable to acquire GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Geolocation access was declined. Map continues operating with manual pan & zoom.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Geolocation request timed out.';
        }
        setLocationError(msg);
        setTimeout(() => setLocationError(null), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Recenter map on India
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(GISMapService.DEFAULT_CENTER_LEAFLET, GISMapService.DEFAULT_ZOOM, {
        duration: 1.0
      });
    }
  }, []);

  // Zoom In / Out handlers
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomOut();
  };

  // Refresh surveillance data trigger
  const handleRefresh = () => {
    setIsSyncing(true);
    setLastRefreshedAt(new Date());
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  // Fallback map projection bounds (for accessible grid mode)
  const mapBounds = { minLat: 11.5, maxLat: 32.5, minLng: 71.5, maxLng: 83.5 };
  const projectToFallbackMap = (lat: number, lng: number) => {
    const cleanLat = Number(lat) || 18.5204;
    const cleanLng = Number(lng) || 73.8567;
    const x = ((cleanLng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - cleanLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      className={`relative w-full ${height} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none`}
    >
      {/* Top Floating Surveillance Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Side: Filter and Layer Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
          {/* Time Window Selector */}
          <div className="flex items-center gap-1 bg-slate-950/90 px-2 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value as SurveillanceTimeWindow)}
              className="bg-transparent text-emerald-300 font-semibold text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Records
              </option>
              <option value="24h" className="bg-slate-900 text-slate-200">
                Last 24 Hours
              </option>
              <option value="7d" className="bg-slate-900 text-slate-200">
                Last 7 Days
              </option>
              <option value="30d" className="bg-slate-900 text-slate-200">
                Last 30 Days
              </option>
              <option value="90d" className="bg-slate-900 text-slate-200">
                Last 90 Days
              </option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Species Filter */}
          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Species</option>
            <option value="Cattle">Cattle</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Pig">Pig</option>
            <option value="Poultry">Poultry</option>
          </select>

          {/* Risk Tier Filter */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk (Red)</option>
            <option value="HIGH">High Risk (Orange)</option>
            <option value="MODERATE">Moderate (Yellow)</option>
            <option value="LOW">Low (Green)</option>
          </select>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Hotspots Quick Pill */}
          <label className="flex items-center gap-1 text-amber-300 font-bold hover:text-amber-200 cursor-pointer px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/40">
            <input
              type="checkbox"
              checked={layerVisibility.hotspots}
              onChange={e =>
                setLayerVisibility(prev => ({ ...prev, hotspots: e.target.checked }))
              }
              className="rounded text-amber-500 focus:ring-0"
            />
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hotspots ({detectedHotspots.length})</span>
          </label>

          {/* Heatmap Quick Toggle */}
          <label className="flex items-center gap-1 text-rose-300 font-bold hover:text-rose-200 cursor-pointer px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/40">
            <input
              type="checkbox"
              checked={layerVisibility.heatmap}
              onChange={e =>
                setLayerVisibility(prev => ({ ...prev, heatmap: e.target.checked }))
              }
              className="rounded text-rose-500 focus:ring-0"
            />
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Heatmap</span>
          </label>

          {/* GIS Layer Control Drawer Trigger */}
          <button
            onClick={() => setShowLayerDrawer(!showLayerDrawer)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
              showLayerDrawer
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
            }`}
            title="Configure GIS Map Layers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>
        </div>

        {/* Right Side: Demo Mode, Location, Refresh, Map Style & Zoom */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Demo Scenario Selector */}
          <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl flex items-center gap-1 text-xs">
            <span className="text-[10px] text-purple-300 font-semibold px-1 flex items-center gap-1">
              <Play className="w-3 h-3 text-purple-400" /> Demo:
            </span>
            <select
              value={demoScenario}
              onChange={e => setDemoScenario(e.target.value as any)}
              className="bg-slate-800 text-purple-200 border border-purple-800/60 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
            >
              <option value="LIVE">Live Surveillance Data</option>
              <option value="fmd_surge">Simulated FMD Surge (Critical)</option>
              <option value="ppr_cluster">Simulated PPR Cluster (High)</option>
              <option value="lsd_vector">Simulated LSD Vector Corridor</option>
            </select>
          </div>

          {/* Online / Offline Status Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/80 border-amber-800/60 text-amber-300'
            }`}
            title={
              isOnline
                ? 'Live external GIS map service connected (OpenStreetMap)'
                : 'Offline: Using locally cached geographic intelligence'
            }
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Use My Location (GPS) */}
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className={`p-1.5 rounded-xl border shadow-xl backdrop-blur-md transition-colors cursor-pointer ${
              userLocation
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
                : 'bg-slate-900/95 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Use My Location (GPS)"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Map Style Selector Popover */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="p-1.5 bg-slate-900/95 text-slate-300 hover:text-white rounded-xl border border-slate-800 shadow-xl backdrop-blur-md hover:bg-slate-800 cursor-pointer"
              title="Change Map Style"
            >
              <Compass className="w-4 h-4" />
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 top-10 w-56 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                  Map Cartography (No API Key Required)
                </p>
                {GISMapService.STYLE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCurrentMapStyle(preset.id);
                      setShowStyleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      currentMapStyle === preset.id
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {currentMapStyle === preset.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setUseFallbackMode(!useFallbackMode);
                      setShowStyleMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer text-[11px]"
                  >
                    {useFallbackMode ? 'Switch to Real Leaflet GIS Map' : 'Switch to Fallback Grid'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Zoom and Recenter Controls */}
          <div className="flex items-center gap-0.5 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRecenter}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Recenter India"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              className={`p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ${
                isSyncing ? 'animate-spin text-emerald-400' : ''
              }`}
              title="Refresh Surveillance Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Simulation Watermark Banner */}
      {activeDataset.isDemo && (
        <div className="absolute top-16 left-4 z-20 pointer-events-none">
          <div className="bg-purple-950/80 border border-purple-800/80 text-purple-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>DEMO SIMULATION: {activeDataset.scenarioName || 'Epidemiological Scenario'}</span>
          </div>
        </div>
      )}

      {/* GPS Location Notification Banner */}
      {locationError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-amber-950/90 border border-amber-800 text-amber-200 text-xs px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{locationError}</span>
        </div>
      )}

      {/* GIS Layer Control Drawer Modal */}
      {showLayerDrawer && (
        <div className="absolute top-16 left-4 z-40 w-72 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>GIS Layer Controls</span>
            </div>
            <button
              onClick={() => setShowLayerDrawer(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Disease & Surveillance
            </p>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.cases}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, cases: e.target.checked }))
                  }
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Disease Cases</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {filteredCases.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer pl-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.verifiedCases}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, verifiedCases: e.target.checked }))
                  }
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span className="text-emerald-300">Verified Cases</span>
              </div>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer pl-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.needsVerificationCases}
                  onChange={e =>
                    setLayerVisibility(prev => ({
                      ...prev,
                      needsVerificationCases: e.target.checked
                    }))
                  }
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-amber-300">Needs Verification</span>
              </div>
              <HelpCircle className="w-3 h-3 text-amber-400" />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer pl-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.lowCredibilityCases}
                  onChange={e =>
                    setLayerVisibility(prev => ({
                      ...prev,
                      lowCredibilityCases: e.target.checked
                    }))
                  }
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span className="text-amber-400">Low Credibility</span>
              </div>
              <span className="text-[9px] text-amber-400/80">Filtered</span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer pl-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.rejectedCases}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, rejectedCases: e.target.checked }))
                  }
                  className="rounded text-slate-500 focus:ring-0"
                />
                <span className="text-slate-400">Rejected Reports (Audit)</span>
              </div>
              <span className="text-[9px] text-slate-500">Muted</span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.hotspots}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, hotspots: e.target.checked }))
                  }
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-amber-300 font-semibold">Hotspot Risk Zones</span>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                {detectedHotspots.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.heatmap}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, heatmap: e.target.checked }))
                  }
                  className="rounded text-rose-500 focus:ring-0"
                />
                <span className="text-rose-300 font-semibold">Disease Heatmap</span>
              </div>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.outbreaks}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, outbreaks: e.target.checked }))
                  }
                  className="rounded text-rose-500 focus:ring-0"
                />
                <span className="text-rose-300">Outbreak Epicenters</span>
              </div>
              <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                {activeDataset.outbreaks.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.containmentRings}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, containmentRings: e.target.checked }))
                  }
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Containment Rings</span>
              </div>
              <span className="text-[9px] text-slate-400">Core + Buffer</span>
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Health Infrastructure
            </p>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.vetCenters}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, vetCenters: e.target.checked }))
                  }
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span className="text-blue-300">Veterinary Hospitals</span>
              </div>
              <Building className="w-3.5 h-3.5 text-blue-400" />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layerVisibility.diagnosticLabs}
                  onChange={e =>
                    setLayerVisibility(prev => ({ ...prev, diagnosticLabs: e.target.checked }))
                  }
                  className="rounded text-purple-500 focus:ring-0"
                />
                <span className="text-purple-300">Diagnostic Laboratories</span>
              </div>
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            </label>
          </div>
        </div>
      )}

      {/* Main Map Viewport */}
      <div className="w-full h-full relative overflow-hidden flex-1">
        {!useFallbackMode ? (
          /* Leaflet Map DOM Container */
          <div
            ref={mapContainerRef}
            className="w-full h-full bg-slate-950"
            style={{ zIndex: 1 }}
          />
        ) : (
          /* Accessible SVG / Fallback Mode */
          <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 opacity-40">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(#10b981 0.75px, transparent 0.75px), radial-gradient(#334155 0.75px, #030712 0.75px)`,
                  backgroundSize: '36px 36px, 12px 12px',
                  backgroundPosition: '0 0, 18px 18px'
                }}
              />
            </div>

            {/* Fallback markers */}
            {filteredCases.map(c => {
              const pos = projectToFallbackMap(c.latitude, c.longitude);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveItem({ type: 'CASE', data: c })}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border border-white text-white font-bold text-[9px] flex items-center justify-center">
                    {c.affectedCount}
                  </div>
                </button>
              );
            })}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300 shadow-xl">
              Showing fallback grid visualization •{' '}
              <button
                onClick={() => setUseFallbackMode(false)}
                className="text-emerald-400 underline font-semibold cursor-pointer ml-1"
              >
                Switch back to Real Leaflet GIS Map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-auto">
          <span className="text-slate-400 font-bold text-[11px]">GIS Legend:</span>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white inline-block" />
            <span className="text-slate-300 text-[11px]">Critical</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white inline-block" />
            <span className="text-slate-300 text-[11px]">High</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 inline-block" />
            <span className="text-slate-300 text-[11px]">Moderate</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white inline-block" />
            <span className="text-slate-300 text-[11px]">Low</span>
          </div>

          <div className="h-3 w-px bg-slate-700 mx-0.5" />

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-dashed border-amber-400 bg-amber-500/20" />
            <span className="text-slate-300 text-[11px]">Hotspot Ring</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-dashed border-rose-400 bg-rose-500/20" />
            <span className="text-slate-300 text-[11px]">Containment Ring</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px]">🧪</span>
            <span className="text-slate-300 text-[11px]">Lab</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px]">🏥</span>
            <span className="text-slate-300 text-[11px]">Vet Clinic</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 shadow-xl pointer-events-auto flex items-center gap-2">
          <span>Real GIS Cartography (Leaflet + OpenStreetMap)</span>
          <span className="text-slate-600">•</span>
          <span>Surveillance Early Warning (Not Diagnosis)</span>
        </div>
      </div>

      {/* Selected Hotspot Intelligence Details Panel */}
      {activeHotspot && (
        <div className="absolute top-16 right-4 z-40 max-w-md w-full">
          <HotspotDetailsPanel
            cluster={activeHotspot}
            timeWindow={timeWindow}
            currentUser={activeUser}
            onClose={() => setActiveHotspot(null)}
            onSelectCase={onSelectCase}
          />
        </div>
      )}

      {/* Selected Item Drawer / Inspection Card (for non-hotspot items) */}
      {activeItem && !activeHotspot && (
        <div className="absolute top-16 right-4 z-40 w-80 bg-slate-900/98 backdrop-blur-md text-white rounded-2xl p-4 border border-slate-700 shadow-2xl animate-in slide-in-from-right-5 duration-150">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                {activeItem.type === 'CASE'
                  ? 'Clinical Case Triage'
                  : activeItem.type === 'OUTBREAK'
                  ? 'Active Outbreak Epicenter'
                  : activeItem.type}
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                {activeItem.type === 'CASE'
                  ? activeItem.data.suspectedDiseases?.[0]?.diseaseName || 'Suspected Case'
                  : activeItem.type === 'OUTBREAK'
                  ? activeItem.data.diseaseName
                  : activeItem.data.name}
              </h4>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs space-y-2 text-slate-300">
            {activeItem.type === 'CASE' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <RiskBadge
                    level={activeItem.data.riskLevel}
                    score={activeItem.data.riskScore}
                    size="sm"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Triage Status:</span>
                  <CaseStatusBadge status={activeItem.data.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.villageName}, {activeItem.data.districtName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Species & Affected:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.species} ({activeItem.data.affectedCount} sick)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credibility:</span>
                  <span
                    className={`font-semibold ${
                      activeItem.data.credibilityStatus === 'VERIFIED'
                        ? 'text-emerald-400'
                        : activeItem.data.credibilityStatus === 'REJECTED'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {activeItem.data.credibilityStatus || 'NEEDS_VERIFICATION'} (
                    {activeItem.data.credibilityScore ?? 70}/100)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Keeper / Farm:</span>
                  <span className="font-semibold text-slate-200">
                    {isFarmer
                      ? 'Farm Operator (Privacy Protected)'
                      : activeItem.data.ownerName || 'Livestock Keeper'}
                  </span>
                </div>
                <div className="mt-2 bg-slate-800/80 p-2 rounded-lg text-[11px] text-slate-300">
                  <p className="font-semibold text-emerald-300 mb-1">Observed Symptoms:</p>
                  <p className="line-clamp-2">
                    {(activeItem.data.symptoms || [])
                      .map((s: any) =>
                        typeof s === 'string' ? s : s?.symptomName || s?.symptomId || 'Symptom'
                      )
                      .join(', ')}
                  </p>
                </div>
              </>
            )}

            {activeItem.type === 'OUTBREAK' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Outbreak Code:</span>
                  <span className="font-mono text-rose-300 font-bold">
                    {activeItem.data.outbreakCode || activeItem.data.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Core Containment:</span>
                  <span className="font-bold text-amber-300">
                    {activeItem.data.radiusKm || 5} km radius
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cases / Deaths:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.totalCases || 0} cases • {activeItem.data.totalDeaths || 0} deaths
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Sector:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.primaryVillage || 'District Sector'}
                  </span>
                </div>
              </>
            )}

            {activeItem.type === 'MORTALITY' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mortality Count:</span>
                  <span className="font-bold text-rose-400">
                    {activeItem.data.deadCount} {activeItem.data.species}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suspected Cause:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.suspectedCause}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Village:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.villageName}
                  </span>
                </div>
              </>
            )}

            {(activeItem.type === 'LAB' || activeItem.type === 'VET') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">District:</span>
                  <span className="font-semibold text-slate-200">
                    {activeItem.data.district}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data Source:</span>
                  <span
                    className={`font-semibold ${
                      activeItem.data.isVerified ? 'text-emerald-400' : 'text-purple-300'
                    }`}
                  >
                    {activeItem.data.isVerified ? 'Official Infrastructure' : 'Demo Facility'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Official veterinary diagnostic and clinical support center.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
