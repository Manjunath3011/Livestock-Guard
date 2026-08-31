import React, { useState, useEffect } from 'react';
import { registrationService } from '../../services/registrationService';
import { RegistrationRequest, AccountStatus, Role, RegistrationAuditLog } from '../../types';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  UserCheck,
  FileCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  History,
  Check,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationApprovalQueueProps {
  onStatusChange?: () => void;
}

export const RegistrationApprovalQueue: React.FC<RegistrationApprovalQueueProps> = ({
  onStatusChange
}) => {
  const [requests, setRequests] = useState<RegistrationRequest[]>(() => registrationService.getAllRequests());
  const [auditLogs, setAuditLogs] = useState<RegistrationAuditLog[]>(() => registrationService.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'requests' | 'audit'>('requests');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Request for Modal Review
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'UNDER_REVIEW'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Refresh lists
  const refreshData = () => {
    setRequests(registrationService.getAllRequests());
    setAuditLogs(registrationService.getAuditLogs());
    if (onStatusChange) onStatusChange();
  };

  useEffect(() => {
    const unsub = registrationService.subscribe(() => {
      setRequests(registrationService.getAllRequests());
      setAuditLogs(registrationService.getAuditLogs());
    });
    return unsub;
  }, []);

  // Filter requests
  const filteredRequests = (requests || []).filter(req => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      !q ||
      (req.id && req.id.toLowerCase().includes(q)) ||
      (req.fullName && req.fullName.toLowerCase().includes(q)) ||
      (req.phone && req.phone.includes(searchQuery)) ||
      (req.email && req.email.toLowerCase().includes(q)) ||
      (req.districtName && req.districtName.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'ALL' || req.requestedRole === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Quick Approve
  const handleQuickApprove = (req: RegistrationRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = registrationService.reviewRegistration(
      req.id,
      'APPROVE',
      'Quick approved by System Administrator after automated credential verification.'
    );
    if (res.success) {
      try {
        confetti({ particleCount: 30, spread: 60 });
      } catch {}
      setActionSuccessMessage(`Approved ${req.fullName} as ${req.requestedRole}.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      refreshData();
    }
  };

  // Handle Review Modal Submission
  const handlePerformReview = () => {
    if (!selectedRequest) return;
    setIsAuthorizing(true);

    const actionMap = {
      APPROVE: 'APPROVE',
      REJECT: 'REJECT',
      REQUEST_INFO: 'REQUEST_INFO',
      UNDER_REVIEW: 'UNDER_REVIEW'
    } as const;

    const res = registrationService.reviewRegistration(
      selectedRequest.id,
      actionMap[reviewDecision],
      reviewNotes || `Review decision: ${reviewDecision}`
    );

    setIsAuthorizing(false);
    if (res.success) {
      if (reviewDecision === 'APPROVE') {
        try {
          confetti({ particleCount: 40, spread: 70 });
        } catch {}
      }
      setActionSuccessMessage(`Updated status for ${selectedRequest.fullName} to ${res.newStatus || reviewDecision}.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      setSelectedRequest(null);
      setReviewNotes('');
      refreshData();
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            VERIFIED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            UNDER REVIEW
          </span>
        );
      case 'MORE_INFORMATION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            MORE INFO
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
            <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            REJECTED
          </span>
        );
      case 'PENDING_VERIFICATION':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            PENDING
          </span>
        );
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'VETERINARIAN':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Veterinarian</span>;
      case 'DIAGNOSTIC_LAB':
      case 'LABORATORY_STAFF':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Diagnostic Lab</span>;
      case 'DISTRICT_OFFICIAL':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">District Official</span>;
      case 'STATE_ADMIN':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">State Admin</span>;
      case 'FIELD_WORKER':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">Field Worker</span>;
      case 'FARMER':
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Farmer</span>;
    }
  };

  const pendingCount = (requests || []).filter(r => r.status === 'PENDING_VERIFICATION' || r.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Identity & Role Verification Queue
              </h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit applicant credentials, verify veterinary council registrations, and approve privileged role activations.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Registrations ({(requests || []).length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Log ({(auditLogs || []).length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* REQUESTS VIEW TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search applicant name, reference ID, phone, district..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-[11px] font-medium">Role:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Roles</option>
                  <option value="VETERINARIAN">Veterinarian</option>
                  <option value="FIELD_WORKER">Field Worker</option>
                  <option value="DIAGNOSTIC_LAB">Diagnostic Lab</option>
                  <option value="DISTRICT_OFFICIAL">District Official</option>
                  <option value="STATE_ADMIN">State Admin</option>
                  <option value="FARMER">Farmer</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="MORE_INFORMATION_REQUIRED">More Info Required</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Applicant & ID</th>
                    <th className="py-3 px-4">Requested Role</th>
                    <th className="py-3 px-4">Contact & Security</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(req => {
                      const isPrivileged = req.requestedRole !== 'FARMER';
                      return (
                        <tr
                          key={req.id}
                          onClick={() => setSelectedRequest(req)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {req.fullName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {req.id}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {getRoleBadge(req.requestedRole)}
                            {req.vetDetails && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">
                                Reg: {req.vetDetails.regNumber} • {req.vetDetails.organization}
                              </div>
                            )}
                            {req.labDetails && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">
                                {req.labDetails.laboratoryName} ({req.labDetails.laboratoryType})
                              </div>
                            )}
                            {req.officialDetails && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">
                                {req.officialDetails.designation} • {req.officialDetails.department}
                              </div>
                            )}
                            {req.fieldWorkerDetails && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">
                                {req.fieldWorkerDetails.organization}
                              </div>
                            )}
                            {req.farmDetails && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">
                                {req.farmDetails.farmName || 'Livestock Farm'} ({req.farmDetails.animalCount} animals)
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                              <span>{req.phone}</span>
                              {req.isPhoneVerified && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1 py-0.5 rounded-sm font-bold">
                                  ✓ OTP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {req.email || 'No email provided'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {req.districtName}, {req.stateName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(req.submittedAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {getStatusBadge(req.status)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {req.status !== 'VERIFIED' && (
                                <button
                                  type="button"
                                  onClick={e => handleQuickApprove(req, e)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  title="Approve & Activate Role"
                                >
                                  Approve
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedRequest(req)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Inspect Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No registration requests match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Immutable Regulatory Registration Audit Logs</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {(auditLogs || []).length} audit entries recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {(auditLogs || []).length > 0 ? (
              auditLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.targetId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target Type: {log.targetType}
                      </span>
                    </div>

                    {log.metadata?.notes && (
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.metadata.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Actor: <strong>{log.actorName}</strong> ({log.actorRole})</span>
                      <span>•</span>
                      <span>User ID: {log.userId}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No audit events logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED INSPECTION & REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Registration Audit: {selectedRequest.fullName}
                  </h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Ref: {selectedRequest.id} • Submitted: {new Date(selectedRequest.submittedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Applicant & Role Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Applicant Identity
                  </div>
                  <div>
                    <span className="text-slate-400">Name: </span>
                    <strong className="text-slate-900 dark:text-white">{selectedRequest.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone: </span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      {selectedRequest.phone} {selectedRequest.isPhoneVerified && '(OTP Verified ✓)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="text-slate-900 dark:text-white">{selectedRequest.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Location: </span>
                    <span className="text-slate-900 dark:text-white">
                      {[selectedRequest.villageName, selectedRequest.blockName, selectedRequest.districtName, selectedRequest.stateName].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Requested Role & Organization
                  </div>
                  <div>
                    <span className="text-slate-400">Role: </span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{selectedRequest.requestedRole}</strong>
                  </div>
                  {selectedRequest.vetDetails && (
                    <>
                      <div>
                        <span className="text-slate-400">Organization: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.vetDetails.organization}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">VCI / State Council Reg #: </span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedRequest.vetDetails.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Authority: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.vetDetails.councilAuthority}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.labDetails && (
                    <>
                      <div>
                        <span className="text-slate-400">Laboratory: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.labDetails.laboratoryName} ({selectedRequest.labDetails.laboratoryType})</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Accreditation #: </span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedRequest.labDetails.accreditationNumber || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.officialDetails && (
                    <>
                      <div>
                        <span className="text-slate-400">Designation: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.officialDetails.designation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Department: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.officialDetails.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Employee ID: </span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedRequest.officialDetails.employeeId}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.fieldWorkerDetails && (
                    <>
                      <div>
                        <span className="text-slate-400">Organization: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.fieldWorkerDetails.organization}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Employee ID: </span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedRequest.fieldWorkerDetails.employeeId || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.farmDetails && (
                    <>
                      <div>
                        <span className="text-slate-400">Farm: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.farmDetails.farmName || 'Livestock Holding'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Animals: </span>
                        <span className="text-slate-900 dark:text-white">{selectedRequest.farmDetails.animalCount} head ({selectedRequest.farmDetails.species?.join(', ')})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Documents Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Attached Verification Documents ({selectedRequest.documents?.length || 0})
                </h4>
                {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {doc.fileName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • {doc.documentType} • 🔒 {doc.secureStorageReference}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified Integrity
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                    No documents uploaded (Farmer instant mobile verification)
                  </div>
                )}
              </div>

              {/* Administrative Review Controls */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Administrative Regulatory Determination
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'APPROVE', label: 'Approve & Activate', icon: <UserCheck className="w-4 h-4 text-emerald-600" /> },
                    { key: 'UNDER_REVIEW', label: 'Mark In Review', icon: <Clock className="w-4 h-4 text-blue-600" /> },
                    { key: 'REQUEST_INFO', label: 'Request More Info', icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
                    { key: 'REJECT', label: 'Reject Application', icon: <UserX className="w-4 h-4 text-red-600" /> }
                  ].map(act => (
                    <button
                      key={act.key}
                      type="button"
                      onClick={() => setReviewDecision(act.key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        reviewDecision === act.key
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {act.icon}
                      <span className="text-[11px] text-center leading-tight">{act.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Review Notes / Statutory Justification
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="e.g. VCI license active until 2029. Identity confirmed against state directorate registry."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handlePerformReview}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                {isAuthorizing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Determination</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
