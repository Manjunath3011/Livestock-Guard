import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { IvrSimulatorModal } from './components/ivr/IvrSimulatorModal';
import { RiskMap } from './components/map/RiskMap';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DemoBanner } from './components/common/DemoBanner';
import { Breadcrumbs } from './components/common/Breadcrumbs';
import { getRoleMetadata, canUserAccessModule } from './auth/roles';
import { LoginPage } from './components/auth/LoginPage';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { PendingVerificationView } from './components/auth/PendingVerificationView';

// Central Role Router
import { RoleRouter } from './components/routing/RoleRouter';

// Specialized Domain Sub-Views
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
import { SystemAdminDashboardView } from './components/views/SystemAdminDashboardView';
import { Role } from './types';
import { Check, Sparkles } from 'lucide-react';

export function App() {
  // Reactive Store State subscription
  const [, setTick] = useState(0);
  const [switchToast, setSwitchToast] = useState<{ visible: boolean; message: string; icon: string } | null>(null);

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

  const normalizedModule = (activeModule || 'dashboard').replace(/-/g, '_');

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseIdForMap(caseId);
    setActiveModule('vet_dashboard');
  };

  const handleCaseCreated = (caseId: string) => {
    setSelectedCaseIdForMap(caseId);
    if (currentUser?.role === 'FARMER') {
      setActiveModule('dashboard');
    } else {
      setActiveModule('vet_dashboard');
    }
  };

  const handleRoleSwitch = (newRole: Role) => {
    const meta = getRoleMetadata(newRole);
    setActiveModule('dashboard');
    setSwitchToast({
      visible: true,
      message: `Switched to ${meta.displayName} (${meta.subtitle})`,
      icon: meta.iconEmoji
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSwitchToast(null);
    }, 2800);
  };

  // Helper to render view content based on normalizedModule
  const renderMainContent = () => {
    // RBAC Security Guard: Verify user has authorized clearance for module
    if (normalizedModule !== 'dashboard' && !canUserAccessModule(currentUser?.role, normalizedModule)) {
      return (
        <AccessDeniedView
          userRole={currentUser?.role || 'FARMER'}
          attemptedModule={normalizedModule}
          onRedirectHome={() => setActiveModule('dashboard')}
        />
      );
    }

    switch (normalizedModule) {
      // PROTECTED ROLE ROUTER: Centralized dispatcher for all 7 role-specific dashboards
      case 'dashboard':
        return (
          <RoleRouter
            currentUser={currentUser}
            cases={cases}
            onNavigate={setActiveModule}
            onSelectCase={handleSelectCase}
          />
        );

      case 'overview_dashboard':
        return (
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
        );

      case 'report_case':
        return (
          <ReportCaseView
            currentUser={currentUser}
            animals={animals}
            farms={farms}
            onCaseCreated={handleCaseCreated}
          />
        );

      case 'vet_dashboard':
        return (
          <VeterinaryDashboardView
            cases={cases}
            currentUser={currentUser}
            onSelectCase={setSelectedCaseIdForMap}
          />
        );

      case 'animals':
        return (
          <AnimalsView
            animals={animals}
            farms={farms}
            currentUser={currentUser}
          />
        );

      case 'herds':
        return (
          <HerdsView
            herds={herds}
            farms={farms}
            currentUser={currentUser}
          />
        );

      case 'risk_map':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Spatial GIS Surveillance Layer
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Interactive Regional Risk Map
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
        );

      case 'outbreaks':
        return (
          <OutbreaksView
            outbreaks={outbreaks}
            onNavigateToMap={() => setActiveModule('risk_map')}
          />
        );

      case 'laboratory':
        return (
          <LaboratoryView
            samples={labSamples}
            currentUser={currentUser}
          />
        );

      case 'vaccinations':
        return (
          <VaccinationsView
            vaccinations={vaccinations}
            animals={animals}
            currentUser={currentUser}
          />
        );

      case 'treatments':
        return (
          <TreatmentsView
            treatments={treatments}
          />
        );

      case 'mortality':
        return (
          <MortalityView
            mortalities={mortalities}
            animals={animals}
            farms={farms}
            currentUser={currentUser}
          />
        );

      case 'knowledge_base':
        return <KnowledgeBaseView />;

      case 'weather':
        return <WeatherView weather={weather} />;

      case 'historical_trends':
        return <HistoricalTrendsView />;

      case 'reports_analytics':
        return <ReportsAnalyticsView />;

      case 'settings':
        return <SettingsView />;

      case 'testing_center':
        return <TestingCenterView />;

      case 'system_admin':
        return <SystemAdminDashboardView onNavigate={setActiveModule} />;

      default:
        // Safe fallback strictly routed via RoleRouter
        return (
          <RoleRouter
            currentUser={currentUser}
            cases={cases}
            onNavigate={setActiveModule}
            onSelectCase={handleSelectCase}
          />
        );
    }
  };

  // If user is not authenticated, display official login page
  if (!store.isAuthenticated() || !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          setActiveModule('dashboard');
          const meta = getRoleMetadata(role);
          setSwitchToast({
            visible: true,
            message: `Authenticated as ${meta.displayName}`,
            icon: meta.iconEmoji
          });
          setTimeout(() => setSwitchToast(null), 3000);
        }}
      />
    );
  }

  // If user is authenticated but awaiting identity/credential verification (and not in demo sandbox)
  if (currentUser && currentUser.accountStatus && currentUser.accountStatus !== 'VERIFIED' && !store.isDemoMode()) {
    return (
      <PendingVerificationView
        user={currentUser}
        onLogout={() => {
          store.logout();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white relative">
      {/* Top Header with Demo Role Switcher */}
      <Header
        currentUser={currentUser}
        alerts={alerts}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenIvr={() => setIsIvrModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearch={query => {
          if (query) setActiveModule('vet_dashboard');
        }}
        onSwitchRole={handleRoleSwitch}
      />

      {/* Demo Mode Notice Banner */}
      <DemoBanner currentUser={currentUser} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Navigation Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeModule={normalizedModule}
          onSelectModule={mod => {
            setActiveModule(mod);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Viewport with Error Boundary */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Breadcrumbs Navigation with Role Context */}
          <Breadcrumbs
            currentUser={currentUser}
            activeModule={normalizedModule}
            onNavigateHome={() => setActiveModule('dashboard')}
          />

          <ErrorBoundary
            activeRole={currentUser?.role || 'FARMER'}
            onReset={() => setActiveModule('dashboard')}
          >
            {renderMainContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Role Switch Toast Notification */}
      {switchToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold">
            <span className="text-lg">{switchToast.icon}</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{switchToast.message}</span>
            </div>
            <div className="ml-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}

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
