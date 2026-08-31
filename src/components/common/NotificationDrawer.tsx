import React, { useState, useEffect } from 'react';
import { Alert, AlertPriority, AlertCategory, User } from '../../types';
import { store } from '../../services/store';
import { notificationService } from '../../services/NotificationService';
import { useTranslation } from '../../i18n/translations';
import { AlertDetailsModal } from './AlertDetailsModal';
import {
  Bell,
  Check,
  ShieldAlert,
  AlertTriangle,
  Syringe,
  FlaskConical,
  X,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  CheckCheck,
  AlertOctagon,
  Info,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Trash2,
  Stethoscope,
  PlusCircle
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts?: Alert[];
  currentUser?: User;
  onSelectAlert?: (alert: Alert) => void;
  onNavigateAction?: (actionType: string, payload?: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts = [],
  currentUser: propUser,
  onSelectAlert,
  onNavigateAction
}) => {
  const { t, currentLang } = useTranslation();
  const activeUser = propUser || store.getCurrentUser();

  const [selectedPriority, setSelectedPriority] = useState<AlertPriority | 'ALL'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [activeAlertForModal, setActiveAlertForModal] = useState<Alert | null>(null);
  const [showDemoControls, setShowDemoControls] = useState<boolean>(false);
  const [, setTick] = useState(0);

  // Subscribe to NotificationService changes
  useEffect(() => {
    const unsub = notificationService.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  // Retrieve scoped, role-filtered and location-filtered notifications
  const scopedAlerts = notificationService.getScopedNotifications(activeUser, {
    priority: selectedPriority,
    unreadOnly
  });

  const allScopedAlerts = notificationService.getScopedNotifications(activeUser, {
    priority: 'ALL'
  });

  const unreadCount = allScopedAlerts.filter(a => !a.isRead).length;
  const criticalCount = allScopedAlerts.filter(a => a.priority === 'CRITICAL').length;
  const highCount = allScopedAlerts.filter(a => a.priority === 'HIGH').length;
  const mediumCount = allScopedAlerts.filter(a => a.priority === 'MEDIUM').length;
  const infoCount = allScopedAlerts.filter(a => a.priority === 'LOW' || a.priority === 'INFO').length;

  const getAlertIcon = (category: AlertCategory | undefined, priority: AlertPriority) => {
    if (priority === 'CRITICAL') {
      return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    }
    switch (category) {
      case 'OUTBREAK':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'HIGH_RISK':
      case 'MORTALITY_CLUSTER':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'ANIMAL_HEALTH':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'VACCINATION_OVERDUE':
        return <Syringe className="w-4 h-4 text-amber-600" />;
      case 'LAB_CONFIRMATION':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'CASE_STATUS':
      case 'CASE_ESCALATION':
        return <AlertOctagon className="w-4 h-4 text-teal-600" />;
      case 'NEARBY_ACTIVITY':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white tracking-wider animate-pulse">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white tracking-wide">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white tracking-wide">
            WARNING
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wide">
            ROUTINE
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-600 text-white tracking-wide">
            INFO
          </span>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleOpenDetails = (alert: Alert) => {
    notificationService.markAsRead(alert.id);
    setActiveAlertForModal(alert);
  };

  const handleCardAction = (e: React.MouseEvent, alert: Alert) => {
    e.stopPropagation();
    notificationService.markAsRead(alert.id);

    if (onSelectAlert) {
      onSelectAlert(alert);
    } else if (onNavigateAction) {
      if (alert.caseId) {
        onNavigateAction('VIEW_CASE', alert.caseId);
      } else if (alert.category === 'OUTBREAK') {
        onNavigateAction('VIEW_OUTBREAKS');
      } else if (alert.actionType === 'REPORT_ANIMAL') {
        onNavigateAction('REPORT_CASE');
      }
    }
  };

  const handleSimulateAlert = (type: 'OUTBREAK' | 'HIGH_RISK' | 'ANIMAL_HEALTH' | 'VACCINATION' | 'CASE_UPDATE' | 'NEARBY_ACTIVITY' | 'LAB_CONFIRM' | 'ML_SYSTEM') => {
    if (activeUser) {
      notificationService.triggerDemoAlertScenario(type, activeUser);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
        <div
          className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl shadow-2xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Notification Center
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                    {activeUser?.role || 'FARMER'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount} unread • Filtered for your location & role
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationService.markAllAsRead(activeUser)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Priority & Status Filtering Tabs */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                onClick={() => setSelectedPriority('ALL')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPriority === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All ({allScopedAlerts.length})
              </button>

              <button
                onClick={() => setSelectedPriority('CRITICAL')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPriority === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Critical ({criticalCount})
              </button>

              <button
                onClick={() => setSelectedPriority('HIGH')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPriority === 'HIGH'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                High ({highCount})
              </button>

              <button
                onClick={() => setSelectedPriority('MEDIUM')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPriority === 'MEDIUM'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Warning ({mediumCount})
              </button>

              <button
                onClick={() => setSelectedPriority('LOW')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPriority === 'LOW'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Info ({infoCount})
              </button>
            </div>

            {/* Sub Filter: Unread Toggle & Demo Trigger */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={e => setUnreadOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Unread only</span>
              </label>

              {/* Demo Mode Alert Simulator Dropdown / Toggle */}
              <button
                onClick={() => setShowDemoControls(!showDemoControls)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Demo Alert Simulator</span>
              </button>
            </div>

            {/* Expandable Demo Alert Simulator Tray */}
            {showDemoControls && (
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Simulate Presentation Alerts
                  </span>
                  <button
                    onClick={() => notificationService.clearAllDemoAlerts()}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Demo Alerts
                  </button>
                </div>
                <p className="text-[10px] text-amber-800 dark:text-amber-400">
                  Click any scenario to inject realistic alerts (clearly labeled as Demo):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleSimulateAlert('OUTBREAK')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-rose-700 dark:text-rose-400 rounded-lg text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    🚨 FMD Outbreak
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('HIGH_RISK')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-orange-700 dark:text-orange-400 rounded-lg text-[10px] font-bold hover:bg-orange-50 dark:hover:bg-orange-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    ⚠️ High Disease Risk
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('ANIMAL_HEALTH')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    🐄 Animal Health Alert
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('VACCINATION')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    💉 Vaccine Due
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('NEARBY_ACTIVITY')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    📍 Nearby Activity
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('LAB_CONFIRM')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-purple-700 dark:text-purple-400 rounded-lg text-[10px] font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors cursor-pointer truncate"
                  >
                    🔬 Lab Positive (LSD)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alerts List Body */}
          <div className="p-4 overflow-y-auto grow space-y-3">
            {scopedAlerts.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
                  <Bell className="w-6 h-6 opacity-40 text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No new notifications
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {unreadOnly
                    ? 'All notifications have been read. Uncheck "Unread only" to see historical alerts.'
                    : 'Your area is currently calm with no active biosecurity alerts.'}
                </p>
                {allScopedAlerts.length === 0 && (
                  <button
                    onClick={() => {
                      if (activeUser) notificationService.populateFullDemoSuite(activeUser);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    + Load Demo Sample Alerts
                  </button>
                )}
              </div>
            ) : (
              scopedAlerts.map(alert => {
                const isCritical = alert.priority === 'CRITICAL';
                const isHigh = alert.priority === 'HIGH';

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleOpenDetails(alert)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      !alert.isRead
                        ? isCritical
                          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-sm'
                          : isHigh
                          ? 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 shadow-sm'
                          : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority / Category Icon */}
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5 shadow-2xs">
                        {getAlertIcon(alert.category, alert.priority)}
                      </div>

                      {/* Content Core */}
                      <div className="grow min-w-0 space-y-1">
                        {/* Top Line: Priority Badge, Demo Badge & Unread Indicator */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getPriorityBadge(alert.priority)}
                            {alert.isDemo && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white uppercase tracking-tight">
                                Demo Alert
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(alert.createdAt)}
                            </span>
                            {!alert.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className={`text-xs font-extrabold leading-snug line-clamp-2 ${
                          !alert.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {alert.title}
                        </h4>

                        {/* Short Message Body */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {alert.message}
                        </p>

                        {/* Location Tag */}
                        {(alert.villageName || alert.districtName || alert.locationRelevance) && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold pt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {[alert.villageName, alert.districtName].filter(Boolean).join(', ')}
                              {alert.locationRelevance ? ` (${alert.locationRelevance})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenDetails(alert);
                            }}
                            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Details & Safety Actions</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {(alert.caseId || alert.actionLabel || alert.category === 'OUTBREAK') && (
                            <button
                              onClick={e => handleCardAction(e, alert)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{alert.actionLabel || (alert.caseId ? 'View Case' : 'View Outbreak')}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              Toll-Free Vet Helpline: 1800-419-VET
            </span>
            <span className="text-[10px]">
              Live Early Warning Network
            </span>
          </div>
        </div>
      </div>

      {/* Full Alert Details Modal */}
      {activeAlertForModal && (
        <AlertDetailsModal
          alert={activeAlertForModal}
          currentUser={activeUser}
          isOpen={Boolean(activeAlertForModal)}
          onClose={() => setActiveAlertForModal(null)}
          onNavigateAction={(actionType, payload) => {
            setActiveAlertForModal(null);
            onClose();
            if (onNavigateAction) {
              onNavigateAction(actionType, payload);
            } else if (onSelectAlert && activeAlertForModal) {
              onSelectAlert(activeAlertForModal);
            }
          }}
        />
      )}
    </>
  );
};
