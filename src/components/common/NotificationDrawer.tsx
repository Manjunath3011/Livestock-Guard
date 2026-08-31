import React from 'react';
import { Alert } from '../../types';
import { store } from '../../services/store';
import { Bell, Check, ShieldAlert, AlertTriangle, Syringe, FlaskConical, X, Clock, MapPin } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts = [],
  onSelectAlert
}) => {
  if (!isOpen) return null;

  const alertList = alerts || [];
  const unreadCount = alertList.filter(a => !a.isRead).length;

  const getAlertIcon = (category: Alert['category']) => {
    switch (category) {
      case 'OUTBREAK':
      case 'HIGH_RISK':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'MORTALITY_CLUSTER':
        return <AlertTriangle className="w-4 h-4 text-rose-700" />;
      case 'VACCINATION_OVERDUE':
        return <Syringe className="w-4 h-4 text-amber-600" />;
      case 'LAB_CONFIRMATION':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Alerts & Advisories</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => store.markAllAlertsRead()}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto grow space-y-3">
          {alertList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No alerts in system.
            </div>
          ) : (
            alertList.map(alert => (
              <div
                key={alert.id}
                onClick={() => {
                  store.markAlertAsRead(alert.id);
                  if (onSelectAlert) onSelectAlert(alert);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  alert.isRead
                    ? 'bg-white border-slate-200 opacity-75 hover:opacity-100'
                    : 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                    {getAlertIcon(alert.category)}
                  </div>

                  <div className="grow min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${alert.isRead ? 'text-slate-800' : 'text-emerald-950'}`}>
                        {alert.title}
                      </h4>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                      {alert.villageName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.villageName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
