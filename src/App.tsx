import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { IvrSimulatorModal } from './components/ivr/IvrSimulatorModal';
import { RiskMap } from './components/map/RiskMap';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ReportCaseView } from './components/views/ReportCaseView';
import { VeterinaryDashboardView } from './components/views/VeterinaryDashboardView';
import { AnimalsView } from './components/views/AnimalsView';
import { HerdsView } from './components/views/HerdsView';
import { LaboratoryView } from './components/views/LaboratoryView';
import { OutbreaksView } from './components/views/OutbreaksView';
import { VaccinationsView } from './components/views/VaccinationsView';
import { TreatmentsView } from './components/views/TreatmentsView';
import { MortalityView } from './components/views/MortalityView';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView';
import { WeatherView } from './components/views/WeatherView';
import { HistoricalTrendsView } from './components/views/HistoricalTrendsView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { TestingCenterView } from './components/views/TestingCenterView';

export function App() {
  // Reactive Store State
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = store.getCurrentUser();
  const cases = store.getCases();
  const outbreaks = store.getOutbreaks();
  const animals = store.getAnimals();
  const herds = store.getHerds();
  const farms = store.getFarms();
  const labSamples = store.getLabSamples();
  const vaccinations = store.getVaccinations();
  const treatments = store.getTreatments();
  const mortalities = store.getMortalityReports();
  const alerts = store.getAlerts();
  const weather = store.getWeather();

  // Navigation & Modal State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isIvrModalOpen, setIsIvrModalOpen] = useState<boolean>(false);
  const [selectedCaseIdForMap, setSelectedCaseIdForMap] = useState<string | undefined>();

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseIdForMap(caseId);
    setActiveModule('vet_dashboard');
  };

  const handleCaseCreated = (caseId: string) => {
    setSelectedCaseIdForMap(caseId);
    setActiveModule('vet_dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        alerts={alerts}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenIvr={() => setIsIvrModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearch={query => {
          if (query) setActiveModule('vet_dashboard');
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Navigation Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeModule={activeModule}
          onSelectModule={mod => {
            setActiveModule(mod);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              cases={cases}
              outbreaks={outbreaks}
              animals={animals}
              mortalities={mortalities}
              alerts={alerts}
              weather={weather}
              onNavigate={mod => setActiveModule(mod)}
              onSelectCase={handleSelectCase}
            />
          )}

          {activeModule === 'report_case' && (
            <ReportCaseView
              currentUser={currentUser}
              animals={animals}
              farms={farms}
              onCaseCreated={handleCaseCreated}
            />
          )}

          {activeModule === 'vet_dashboard' && (
            <VeterinaryDashboardView
              cases={cases}
              currentUser={currentUser}
              onSelectCase={setSelectedCaseIdForMap}
            />
          )}

          {activeModule === 'animals' && (
            <AnimalsView
              animals={animals}
              farms={farms}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'herds' && (
            <HerdsView
              herds={herds}
              farms={farms}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'risk_map' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Spatial GIS Surveillance Layer
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Interactive Regional Risk Map
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time spatial mapping of active cases, mortality clusters, 10km quarantine buffer rings, and veterinary labs.
                  </p>
                </div>
              </div>

              <RiskMap
                cases={cases}
                outbreaks={outbreaks}
                mortalities={mortalities}
                selectedCaseId={selectedCaseIdForMap}
                onSelectCase={id => setSelectedCaseIdForMap(id)}
                height="h-[640px]"
              />
            </div>
          )}

          {activeModule === 'outbreaks' && (
            <OutbreaksView
              outbreaks={outbreaks}
              onNavigateToMap={() => setActiveModule('risk_map')}
            />
          )}

          {activeModule === 'laboratory' && (
            <LaboratoryView
              samples={labSamples}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'vaccinations' && (
            <VaccinationsView
              vaccinations={vaccinations}
              animals={animals}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'treatments' && (
            <TreatmentsView
              treatments={treatments}
            />
          )}

          {activeModule === 'mortality' && (
            <MortalityView
              mortalities={mortalities}
              animals={animals}
              farms={farms}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'knowledge_base' && (
            <KnowledgeBaseView />
          )}

          {activeModule === 'weather' && (
            <WeatherView weather={weather} />
          )}

          {activeModule === 'historical_trends' && (
            <HistoricalTrendsView />
          )}

          {activeModule === 'reports_analytics' && (
            <ReportsAnalyticsView />
          )}

          {activeModule === 'settings' && (
            <SettingsView />
          )}

          {activeModule === 'testing_center' && (
            <TestingCenterView />
          )}
        </main>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        alerts={alerts}
        onSelectAlert={alert => {
          if (alert.caseId) {
            handleSelectCase(alert.caseId);
          } else if (alert.category === 'OUTBREAK') {
            setActiveModule('outbreaks');
          }
          setIsNotificationDrawerOpen(false);
        }}
      />

      {/* Interactive IVR Toll-Free Voice Assistant Modal */}
      <IvrSimulatorModal
        isOpen={isIvrModalOpen}
        onClose={() => setIsIvrModalOpen(false)}
      />
    </div>
  );
}

export default App;
