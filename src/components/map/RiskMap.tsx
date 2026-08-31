import React, { useState, useMemo } from 'react';
import { Case, Outbreak, MortalityReport, Species, RiskLevel, User, LabSample } from '../../types';
import {
  HotspotCluster,
  HotspotRiskTier,
  DiseaseActivityClassification,
  DiseaseActivityTrend,
  SurveillanceTimeWindow
} from '../../types/gis';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Filter,
  AlertTriangle,
  Info,
  Shield,
  Building,
  FlaskConical,
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Play,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { GISHotspotEngine } from '../../services/GISHotspotEngine';
import { HotspotDetailsPanel } from './HotspotDetailsPanel';
import { store } from '../../services/store';

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
  height = 'h-[580px]'
}) => {
  const activeUser = currentUser || store.getCurrentUser();

  // Layer toggles
  const [showHotspots, setShowHotspots] = useState(true);
  const [showCases, setShowCases] = useState(true);
  const [showOutbreaks, setShowOutbreaks] = useState(true);
  const [showMortalities, setShowMortalities] = useState(true);
  const [showContainmentRings, setShowContainmentRings] = useState(true);
  const [showVetCenters, setShowVetCenters] = useState(true);
  const [showDiagnosticLabs, setShowDiagnosticLabs] = useState(true);

  // Surveillance Filters
  const [timeWindow, setTimeWindow] = useState<SurveillanceTimeWindow>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Demo Scenarios Switcher
  const [demoScenario, setDemoScenario] = useState<'LIVE' | 'fmd_surge' | 'ppr_cluster' | 'lsd_vector'>('LIVE');

  // Zoom and Center State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected item modal & Hotspot inspection
  const [activeItem, setActiveItem] = useState<{
    type: 'CASE' | 'OUTBREAK' | 'MORTALITY' | 'LAB' | 'VET';
    data: any;
  } | null>(null);

  const [activeHotspot, setActiveHotspot] = useState<HotspotCluster | null>(null);

  // Fixed static reference points for Labs & Vet Centers
  const staticInfrastructure = [
    { id: 'vet_baramati', name: 'Baramati Veterinary Polyclinic & Hospital', type: 'VET', lat: 18.158, lng: 74.572, district: 'Pune' },
    { id: 'vet_karad', name: 'Karad Taluka Veterinary Dispensary', type: 'VET', lat: 17.291, lng: 74.185, district: 'Satara' },
    { id: 'vet_chikodi', name: 'Chikodi Veterinary Hospital', type: 'VET', lat: 16.402, lng: 74.385, district: 'Belagavi' },
    { id: 'lab_pune', name: 'Pune District Disease Investigation Lab (DIAL)', type: 'LAB', lat: 18.520, lng: 73.856, district: 'Pune' },
    { id: 'lab_anand', name: 'Anand Veterinary College Diagnostic Core Lab', type: 'LAB', lat: 22.564, lng: 72.928, district: 'Anand' }
  ];

  // Map Bounds Projection (Covers western/central India region: Lat 11.5 to 32.5, Lng 71.5 to 83.5)
  const mapBounds = {
    minLat: 11.5,
    maxLat: 32.5,
    minLng: 71.5,
    maxLng: 83.5
  };

  const projectToMap = (lat: number, lng: number) => {
    const cleanLat = Number(lat) || 18.5204;
    const cleanLng = Number(lng) || 73.8567;
    // Normalization to 0% to 100%
    const x = ((cleanLng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - cleanLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Active data source (Live vs Demo Simulation)
  const demoScenarios = useMemo(() => GISHotspotEngine.getDemoScenarios(), []);

  const activeDataset = useMemo(() => {
    if (demoScenario === 'LIVE') {
      return {
        cases: cases || [],
        outbreaks: outbreaks || [],
        isDemo: false
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
      isDemo: false
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className={`relative w-full ${height} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none`}>
      {/* Top Controls & Surveillance Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer & Filters Pills */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg text-xs">
          {/* Time Surveillance Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value as SurveillanceTimeWindow)}
              className="bg-transparent text-emerald-300 font-semibold text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Records</option>
              <option value="24h" className="bg-slate-900 text-slate-200">Last 24 Hours</option>
              <option value="7d" className="bg-slate-900 text-slate-200">Last 7 Days</option>
              <option value="30d" className="bg-slate-900 text-slate-200">Last 30 Days</option>
              <option value="90d" className="bg-slate-900 text-slate-200">Last 90 Days</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          <div className="flex items-center gap-1.5 text-slate-400 font-semibold px-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters:</span>
          </div>

          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Species</option>
            <option value="Cattle">Cattle</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Pig">Pig</option>
            <option value="Poultry">Poultry</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk (Red)</option>
            <option value="HIGH">High Risk (Orange)</option>
            <option value="MODERATE">Moderate (Yellow)</option>
            <option value="LOW">Low (Green)</option>
          </select>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Hotspot Zones Toggle */}
          <label className="flex items-center gap-1.5 text-amber-300 font-bold hover:text-amber-200 cursor-pointer px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/40">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={e => setShowHotspots(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0"
            />
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hotspots ({detectedHotspots.length})</span>
          </label>

          {/* Quick Layer Toggles */}
          <label className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showCases}
              onChange={e => setShowCases(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0"
            />
            <span>Cases ({filteredCases.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showOutbreaks}
              onChange={e => setShowOutbreaks(e.target.checked)}
              className="rounded text-rose-500 focus:ring-0"
            />
            <span>Outbreaks ({(activeDataset.outbreaks || []).length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showContainmentRings}
              onChange={e => setShowContainmentRings(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0"
            />
            <span>Containment Rings</span>
          </label>
        </div>

        {/* Demo Scenarios & Zoom Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Demo Scenario Selector */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-400 font-semibold px-1 flex items-center gap-1">
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

          {/* Zoom / Recenter Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 2.8))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.8))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset Map Center"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div
        className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transformable Canvas Layer */}
        <div
          className="absolute inset-0 transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
          }}
        >
          {/* Stylized GIS Grid Map Background */}
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

          {/* District Surveillance Boundaries Overlay (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <path
              d="M 120 180 Q 280 140 450 170 T 780 220 Q 880 340 760 480 T 360 520 Q 180 460 120 180 Z"
              fill="rgba(16, 185, 129, 0.03)"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 220 220 Q 320 200 420 240 T 560 380 Q 420 460 280 400 Z"
              fill="rgba(56, 189, 248, 0.02)"
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="1.5"
            />
          </svg>

          {/* 1. Dynamic Intelligent Hotspot Zones Overlay */}
          {showHotspots &&
            detectedHotspots.map(cluster => {
              const pos = projectToMap(cluster.centerLat, cluster.centerLng);
              const isSelected = activeHotspot?.id === cluster.id;

              const hotspotStyles: Record<
                HotspotRiskTier,
                { radial: string; border: string; badge: string; pinBg: string; ping: boolean }
              > = {
                CRITICAL: {
                  radial: 'radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, rgba(225, 29, 72, 0.08) 60%, transparent 80%)',
                  border: 'border-rose-500/80',
                  badge: 'bg-rose-600 text-white',
                  pinBg: 'bg-rose-600',
                  ping: true
                },
                HIGH: {
                  radial: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.06) 60%, transparent 80%)',
                  border: 'border-orange-500/70',
                  badge: 'bg-orange-500 text-white',
                  pinBg: 'bg-orange-500',
                  ping: true
                },
                MODERATE: {
                  radial: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.04) 60%, transparent 80%)',
                  border: 'border-amber-400/60',
                  badge: 'bg-amber-400 text-slate-900',
                  pinBg: 'bg-amber-400',
                  ping: false
                },
                LOW: {
                  radial: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.02) 60%, transparent 80%)',
                  border: 'border-emerald-500/50',
                  badge: 'bg-emerald-500 text-white',
                  pinBg: 'bg-emerald-500',
                  ping: false
                }
              };

              const style = hotspotStyles[cluster.riskTier] || hotspotStyles.LOW;
              const zoneDiameter = Math.min(220, Math.max(100, cluster.radiusKm * 8));

              return (
                <div
                  key={`hotspot_${cluster.id}`}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveHotspot(cluster);
                    setActiveItem(null);
                  }}
                >
                  {/* Dynamic Radial Density Glow Zone */}
                  <div
                    className={`rounded-full transition-all duration-300 ${style.border} border border-dashed flex items-center justify-center`}
                    style={{
                      width: `${zoneDiameter}px`,
                      height: `${zoneDiameter}px`,
                      background: style.radial
                    }}
                  >
                    {/* Ping Radar Wave for Critical/High Hotspots */}
                    {style.ping && (
                      <div className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full border border-rose-500/40 animate-ping duration-1000" />
                    )}

                    {/* Central Interactive Cluster Core Pin */}
                    <div
                      className={`relative z-20 flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-white shadow-2xl transition-transform ${
                        isSelected ? 'scale-125 ring-4 ring-emerald-400' : 'group-hover:scale-110'
                      } ${style.badge}`}
                    >
                      {cluster.riskTier === 'CRITICAL' ? (
                        <Flame className="w-3 h-3 fill-current animate-pulse" />
                      ) : cluster.riskTier === 'HIGH' ? (
                        <AlertTriangle className="w-3 h-3 fill-current" />
                      ) : (
                        <Activity className="w-3 h-3" />
                      )}
                      <span className="font-extrabold text-[10px] tracking-tight whitespace-nowrap">
                        {cluster.riskScore}
                      </span>
                    </div>

                    {/* Hotspot Hover Tooltip Card */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] font-medium whitespace-nowrap shadow-2xl z-40 pointer-events-none">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={`w-2 h-2 rounded-full ${style.pinBg}`} />
                        <span>{cluster.name}</span>
                        {cluster.trend === 'INCREASING' && <TrendingUp className="w-3 h-3 text-rose-400" />}
                        {cluster.trend === 'DECREASING' && <TrendingDown className="w-3 h-3 text-emerald-400" />}
                        {cluster.trend === 'STABLE' && <Minus className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">
                        {cluster.classification.replace(/_/g, ' ')} • {cluster.currentPeriodCaseCount} Cases ({cluster.totalAffectedAnimals} Sick)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* 2. Containment Zones & Outbreak Radius Rings */}
          {showContainmentRings &&
            (activeDataset.outbreaks || []).map(outb => {
              const pos = projectToMap(outb.latitude, outb.longitude);
              return (
                <div
                  key={`ring_${outb.id}`}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* Outer Buffer Ring (15km) */}
                  <div className="w-48 h-48 rounded-full border border-dashed border-amber-400/30 bg-amber-500/5 animate-spin duration-30000" />
                  {/* Inner Quarantine Ring (10km) */}
                  <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border-2 border-rose-500/60 bg-rose-500/10 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 whitespace-nowrap">
                    {outb.radiusKm}km Zone: {outb.diseaseName}
                  </div>
                </div>
              );
            })}

          {/* 3. Diagnostic Laboratories */}
          {showDiagnosticLabs &&
            staticInfrastructure
              .filter(i => i.type === 'LAB')
              .map(lab => {
                const pos = projectToMap(lab.lat, lab.lng);
                return (
                  <button
                    key={lab.id}
                    onClick={e => {
                      e.stopPropagation();
                      setActiveItem({ type: 'LAB', data: lab });
                      setActiveHotspot(null);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className="p-2 bg-purple-900/90 text-purple-200 border border-purple-400/50 rounded-xl shadow-lg hover:scale-125 transition-transform flex items-center justify-center">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800 whitespace-nowrap z-30">
                      {lab.name}
                    </span>
                  </button>
                );
              })}

          {/* 4. Veterinary Polyclinics */}
          {showVetCenters &&
            staticInfrastructure
              .filter(i => i.type === 'VET')
              .map(vet => {
                const pos = projectToMap(vet.lat, vet.lng);
                return (
                  <button
                    key={vet.id}
                    onClick={e => {
                      e.stopPropagation();
                      setActiveItem({ type: 'VET', data: vet });
                      setActiveHotspot(null);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className="p-1.5 bg-blue-900/90 text-blue-200 border border-blue-400/50 rounded-lg shadow-lg hover:scale-125 transition-transform flex items-center justify-center">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-blue-200 text-[10px] px-2 py-0.5 rounded border border-blue-800 whitespace-nowrap z-30">
                      {vet.name}
                    </span>
                  </button>
                );
              })}

          {/* 5. Mortality Reports */}
          {showMortalities &&
            mortalities.map(m => {
              const pos = projectToMap(m.latitude, m.longitude);
              return (
                <button
                  key={m.id}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveItem({ type: 'MORTALITY', data: m });
                    setActiveHotspot(null);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25 group cursor-pointer"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-red-600 text-red-500 font-bold flex items-center justify-center text-xs shadow-lg hover:scale-125 transition-transform">
                      ☠
                    </div>
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {m.deadCount}
                    </span>
                  </div>
                </button>
              );
            })}

          {/* 6. Active Disease Cases */}
          {showCases &&
            filteredCases.map(c => {
              const pos = projectToMap(c.latitude, c.longitude);
              const isSelected = selectedCaseId === c.id;

              const colorMap: Record<RiskLevel, { pin: string; glow: string }> = {
                CRITICAL: { pin: 'bg-rose-600 border-white text-white', glow: 'bg-rose-500/40 animate-ping' },
                HIGH: { pin: 'bg-orange-500 border-white text-white', glow: 'bg-orange-500/30' },
                MODERATE: { pin: 'bg-amber-400 border-slate-900 text-slate-900', glow: 'bg-amber-400/20' },
                LOW: { pin: 'bg-emerald-500 border-white text-white', glow: 'bg-emerald-500/20' }
              };

              const clr = colorMap[c.riskLevel] || colorMap.LOW;

              return (
                <button
                  key={c.id}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveItem({ type: 'CASE', data: c });
                    setActiveHotspot(null);
                    if (onSelectCase) onSelectCase(c.id);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Ping Glow for High/Critical */}
                    {(c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH') && (
                      <div className={`absolute w-8 h-8 rounded-full ${clr.glow}`} />
                    )}

                    {/* Marker Pin */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 shadow-xl flex items-center justify-center font-bold text-[10px] transition-transform ${clr.pin} ${
                        isSelected ? 'scale-150 ring-4 ring-emerald-400' : 'group-hover:scale-125'
                      }`}
                    >
                      {c.affectedCount}
                    </div>

                    {/* Tooltip Hover Badge */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 text-slate-200 px-2 py-1 rounded border border-slate-700 text-[10px] font-medium whitespace-nowrap shadow-xl z-40 pointer-events-none">
                      <p className="font-bold text-white">{c.suspectedDiseases?.[0]?.diseaseName || 'Case'}</p>
                      <p className="text-slate-400">{c.villageName} • {c.species}</p>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Bottom Map Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-auto">
          <span className="text-slate-400 font-semibold">GIS Map Legend:</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white inline-block" />
            <span className="text-slate-300">Critical Risk</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white inline-block" />
            <span className="text-slate-300">High Risk</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-slate-900 inline-block" />
            <span className="text-slate-300">Moderate</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />
            <span className="text-slate-300">Low Risk</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-dashed border-amber-400 bg-amber-500/20" />
            <span className="text-slate-300">Hotspot Zone</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-dashed border-rose-400 bg-rose-500/20" />
            <span className="text-slate-300">Containment Ring</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-purple-900 text-purple-200 rounded text-[9px]">🧪</div>
            <span className="text-slate-300">Lab</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-blue-900 text-blue-200 rounded text-[9px]">🏥</div>
            <span className="text-slate-300">Vet Center</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-auto">
          Epidemiological Early Warning • Not a Clinical Diagnosis
        </div>
      </div>

      {/* Selected Hotspot Intelligence Details Panel */}
      {activeHotspot && (
        <div className="absolute top-16 right-4 z-40">
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
        <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 border border-slate-700 shadow-2xl animate-in slide-in-from-right-5 duration-150">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                {activeItem.type === 'CASE' ? 'Clinical Case Triage' : activeItem.type}
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                {activeItem.type === 'CASE'
                  ? activeItem.data.suspectedDiseases?.[0]?.diseaseName || 'Suspected Case'
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
                  <RiskBadge level={activeItem.data.riskLevel} score={activeItem.data.riskScore} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Triage Status:</span>
                  <CaseStatusBadge status={activeItem.data.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-200">{activeItem.data.villageName}, {activeItem.data.districtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Species & Affected:</span>
                  <span className="font-semibold text-slate-200">{activeItem.data.species} ({activeItem.data.affectedCount} sick)</span>
                </div>
                <div className="mt-2 bg-slate-800/80 p-2 rounded-lg text-[11px] text-slate-300">
                  <p className="font-semibold text-emerald-300 mb-1">Observed Symptoms:</p>
                  <p className="line-clamp-2">
                    {(activeItem.data.symptoms || []).map((s: any) => typeof s === 'string' ? s : s?.symptomName || s?.symptomId || 'Symptom').join(', ')}
                  </p>
                </div>
              </>
            )}

            {activeItem.type === 'MORTALITY' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mortality Count:</span>
                  <span className="font-bold text-rose-400">{activeItem.data.deadCount} {activeItem.data.species}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suspected Cause:</span>
                  <span className="font-semibold text-slate-200">{activeItem.data.suspectedCause}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Village:</span>
                  <span className="font-semibold text-slate-200">{activeItem.data.villageName}</span>
                </div>
                <div className="bg-rose-950/60 border border-rose-800/60 p-2 rounded-lg text-[11px] text-rose-200">
                  {activeItem.data.necropsyFindings || 'No-necropsy biosecurity rule in effect.'}
                </div>
              </>
            )}

            {(activeItem.type === 'LAB' || activeItem.type === 'VET') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">District:</span>
                  <span className="font-semibold text-slate-200">{activeItem.data.district}</span>
                </div>
                <p className="text-[11px] text-slate-400">
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
