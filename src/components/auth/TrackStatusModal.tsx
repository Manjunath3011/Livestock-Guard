import React, { useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { RegistrationRequest, AccountStatus } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  X,
  PhoneCall,
  Lock,
  RefreshCw
} from 'lucide-react';

interface TrackStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSignIn?: () => void;
}

export const TrackStatusModal: React.FC<TrackStatusModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSignIn
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [foundRequest, setFoundRequest] = useState<RegistrationRequest | null>(() => {
    return initialQuery ? registrationService.trackRegistration(initialQuery) || null : null;
  });
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const req = registrationService.trackRegistration(query);
    setFoundRequest(req || null);
    setHasSearched(true);
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          label: 'VERIFIED & ACTIVE',
          class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          title: 'Account Verification Complete',
          desc: 'Your credentials have been authenticated. You can sign in to access your authorized command center.'
        };
      case 'UNDER_REVIEW':
        return {
          icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />,
          label: 'UNDER REVIEW',
          class: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          title: 'Under Active Regulatory Review',
          desc: 'Your submitted professional credentials are being audited by state animal-health administrators.'
        };
      case 'MORE_INFORMATION_REQUIRED':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          label: 'MORE INFO REQUIRED',
          class: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          title: 'Additional Documentation Required',
          desc: 'The reviewing officer has requested supplemental documents or clarification.'
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
          label: 'REJECTED',
          class: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800',
          title: 'Verification Not Approved',
          desc: 'Your registration could not be verified with the regulatory authority. Please contact support.'
        };
      case 'SUSPENDED':
        return {
          icon: <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
          label: 'SUSPENDED',
          class: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          title: 'Account Suspended',
          desc: 'Account access has been temporarily restricted by system administrators.'
        };
      case 'PENDING_VERIFICATION':
      default:
        return {
          icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />,
          label: 'PENDING VERIFICATION',
          class: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          title: 'Queued for Verification',
          desc: 'Your account has been created successfully and is queued for verification by the regulatory authority.'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scaleIn">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Track Registration Status
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Check the real-time identity & credential audit status of your application
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter Registration ID (e.g. LG-REG-781042), Phone, or Email"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Demo Pre-sets for evaluation */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium">Test lookup:</span>
            {[
              { id: 'LG-REG-781042', label: 'Pending Vet' },
              { id: 'LG-REG-652391', label: 'Under Review FW' },
              { id: 'LG-REG-549112', label: 'More Info Lab' },
              { id: 'LG-REG-901428', label: 'Pending Official' }
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setQuery(preset.id);
                  const req = registrationService.trackRegistration(preset.id);
                  setFoundRequest(req || null);
                  setHasSearched(true);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 cursor-pointer font-mono"
              >
                {preset.id} ({preset.label})
              </button>
            ))}
          </div>

          {/* Search Result View */}
          {hasSearched && (
            foundRequest ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Status Hero Box */}
                {(() => {
                  const badge = getStatusBadge(foundRequest.status);
                  return (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-black text-slate-500 dark:text-slate-400">
                          {foundRequest.id}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badge.class}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {badge.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {badge.desc}
                        </p>
                      </div>

                      {foundRequest.reviewNotes && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                          <strong>Reviewer Notes:</strong> {foundRequest.reviewNotes}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Application Details Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Applicant Name</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{foundRequest.fullName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Requested Role</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{foundRequest.requestedRole}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Submitted Date</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(foundRequest.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Jurisdiction</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {foundRequest.districtName}, {foundRequest.stateName}
                    </span>
                  </div>
                </div>

                {/* Documents Attached */}
                {foundRequest.documents && foundRequest.documents.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Submitted Supporting Documents
                    </span>
                    <div className="space-y-1.5">
                      {foundRequest.documents.map((doc, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">{doc.fileName}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {doc.documentType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button if verified */}
                {foundRequest.status === 'VERIFIED' && onSignIn && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSignIn();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Sign In to Your Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  No Registration Record Found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We could not find an application matching "{query}". Please check your registration ID, registered phone number, or email address.
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Need Help? Call 1800-419-VET (Toll-Free)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
