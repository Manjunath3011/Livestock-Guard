import React, { useState } from 'react';
import { User, RegistrationRequest, AccountStatus } from '../../types';
import { store } from '../../services/store';
import { registrationService } from '../../services/registrationService';
import {
  Shield,
  Clock,
  AlertTriangle,
  FileText,
  PhoneCall,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TrackStatusModal } from './TrackStatusModal';

interface PendingVerificationViewProps {
  user: User;
  onLogout: () => void;
}

export const PendingVerificationView: React.FC<PendingVerificationViewProps> = ({
  user,
  onLogout
}) => {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Look up user's registration request if available
  const userRequest: RegistrationRequest | undefined =
    (user.registrationRequestId && registrationService.getRequestById(user.registrationRequestId)) ||
    registrationService.trackRegistration(user.phone) ||
    registrationService.trackRegistration(user.email);

  const status: AccountStatus = user.accountStatus || 'PENDING_VERIFICATION';
  const requestedRole = user.requestedRole || user.role || 'VETERINARIAN';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
              LIVESTOCK<span className="text-emerald-600 dark:text-emerald-400">GUARD</span>
            </span>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Verification Gateway
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-xs font-bold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Center Body Card */}
      <main className="max-w-xl mx-auto w-full my-auto py-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-9 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          
          {/* Status Icon */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-300 dark:border-amber-800 animate-pulse">
              <Clock className="w-9 h-9" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Your Account is Awaiting Verification
            </h2>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your registration as <strong className="text-slate-900 dark:text-white">{requestedRole.replace('_', ' ')}</strong> requires identity & statutory credential authorization before privileged dashboard access is activated.
            </p>
          </div>

          {/* Details Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registration ID
                </span>
                <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {user.registrationRequestId || userRequest?.id || 'LG-REG-781042'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Requested Role
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {requestedRole}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Verification Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{status.replace('_', ' ')}</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Submitted Date
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {userRequest?.submittedAt ? new Date(userRequest.submittedAt).toLocaleDateString() : 'August 24, 2026'}
                </span>
              </div>
            </div>

            {user.statusReason && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>Reviewer Note:</strong> {user.statusReason}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-start gap-3">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Biosecurity Protocol:</strong> LivestockGuard enforces strict role-based access control under statutory animal-health regulations. You will receive an SMS and email notification when your credentials have been verified by the district veterinary directorate.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Contact Support</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out & Return to Sign In</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
        <span>Need urgent clinical assistance? Call National Veterinary Helpline 1800-419-VET (24x7)</span>
      </footer>

      {/* Track Status Modal */}
      <TrackStatusModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialQuery={user.registrationRequestId || user.phone || user.email}
      />

      {/* Support Helpline Dialog */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Biosecurity Support Helpline</span>
              </h3>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400">
              For expediting statutory role verification or providing emergency outbreak documentation, reach out to our verification officers:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Toll-Free Helpline:</span>
                <strong className="text-emerald-600 font-mono">1800-419-VET (838)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Desk:</span>
                <strong className="text-slate-900 dark:text-white font-mono">verify@livestockguard.gov.in</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Working Hours:</span>
                <span className="text-slate-700 dark:text-slate-300">24x7 Emergency Response</span>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
