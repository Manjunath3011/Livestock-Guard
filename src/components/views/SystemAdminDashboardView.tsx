import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Settings,
  Activity,
  Sliders,
  Database,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Lock,
  Server,
  Zap,
  Terminal,
  Cpu,
  Eye,
  Key,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { store } from '../../services/store';
import { User, SystemConfig, Role } from '../../types';
import { USER_ROLES } from '../../auth/roles';
import { RegistrationApprovalQueue } from '../auth/RegistrationApprovalQueue';
import confetti from 'canvas-confetti';

interface SystemAdminDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const SystemAdminDashboardView: React.FC<SystemAdminDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [users, setUsers] = useState<User[]>(store.getAllUsers());
  const [config, setConfig] = useState<SystemConfig>(store.getSystemConfig());
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'rules' | 'audit' | 'system'>('overview');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const refreshData = () => {
    setCurrentUser(store.getCurrentUser());
    setUsers(store.getAllUsers());
    setConfig(store.getSystemConfig());
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSystemConfig(config);
    setSavedSuccess('Risk Engine surveillance parameters updated across all clusters.');
    try {
      confetti({ particleCount: 30, spread: 60 });
    } catch (err) {}
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleResetSeedData = () => {
    if (window.confirm('Reset all surveillance data to the national seed state? This will restore initial farms, cases, and alerts.')) {
      store.resetToSeedData();
      refreshData();
      setSavedSuccess('Surveillance repository reset to verified national baseline.');
      setTimeout(() => setSavedSuccess(null), 3500);
    }
  };

  const handleRoleChangeForUser = (userId: string, newRole: Role) => {
    // In demo store, update user's role
    const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    setSavedSuccess(`Role for user updated to ${newRole}`);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const totalFarms = store.getFarms().length;
  const totalAnimals = store.getAnimals().length;
  const totalCases = store.getCases().length;
  const activeOutbreaks = store.getOutbreaks().filter(o => o.status === 'ACTIVE').length;
  const offlineQueue = store.getOfflineQueue().length;

  return (
    <div className="space-y-6 pb-12">
      {/* Visual Header / Command Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ADMINISTRATOR COMMAND CENTER
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              System Administration & Core Architecture
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized administrative gateway: Manage role permissions, AI surveillance weights, algorithm thresholds, and audit integrity logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('testing_center')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Simulation Sandbox</span>
            </button>
            <button
              onClick={handleResetSeedData}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Factory Reset</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'System Telemetry', icon: Cpu },
            { id: 'verifications', label: 'Identity & Registration Queue', icon: ShieldCheck },
            { id: 'users', label: 'Users & Roles (RBAC)', icon: Users },
            { id: 'rules', label: 'Risk Engine Parameters', icon: Sliders },
            { id: 'audit', label: 'Security & Audit Logs', icon: Shield },
            { id: 'system', label: 'Storage & Diagnostics', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* TAB: IDENTITY & REGISTRATION APPROVAL QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <RegistrationApprovalQueue onStatusChange={refreshData} />
        </div>
      )}

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Farms</div>
              <div className="text-2xl font-black text-white mt-1">{totalFarms}</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">100% geo-referenced</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexed Animals</div>
              <div className="text-2xl font-black text-white mt-1">{totalAnimals}</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">RFID / 12-digit UID</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surveillance Cases</div>
              <div className="text-2xl font-black text-white mt-1">{totalCases}</div>
              <div className="text-[10px] text-amber-400 mt-1 font-semibold">Clinical & Lab Reports</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Outbreaks</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{activeOutbreaks}</div>
              <div className="text-[10px] text-rose-400 mt-1 font-semibold">Containment rings enforced</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline Sync Queue</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{offlineQueue}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-semibold">0 failed transactions</div>
            </div>
          </div>

          {/* Core System Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Cluster Node Health</span>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Multi-Role Router Dispatcher', status: 'LOCKED & VERIFIED', latency: '0.4ms', health: 100 },
                  { name: 'Bayesian Disease Inference Matrix', status: 'ONLINE', latency: '1.2ms', health: 100 },
                  { name: 'Spatial GIS Buffer Generator', status: 'ONLINE', latency: '2.8ms', health: 98 },
                  { name: 'IVR Voice Toll-Free Gateway (1800-419-VET)', status: 'ACTIVE', latency: '42ms', health: 100 },
                  { name: 'Offline SQLite / IndexedDB Sync Engine', status: 'SYNCHRONIZED', latency: '0.1ms', health: 100 }
                ].map((node, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{node.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-600 font-semibold">{node.status}</span>
                        <span>•</span>
                        <span>Latency: {node.latency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600">{node.health}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Role Access Distribution (7 Protected Roles)</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { role: 'FARMER', count: 1240, label: 'Livestock Owners / Smallholders', color: 'bg-emerald-500' },
                  { role: 'FIELD_WORKER', count: 320, label: 'Field Para-Vets & Community Workers', color: 'bg-teal-500' },
                  { role: 'VETERINARIAN', count: 145, label: 'Registered Veterinary Doctors', color: 'bg-blue-500' },
                  { role: 'LABORATORY_STAFF', count: 28, label: 'Diagnostic Lab Officers & Pathologists', color: 'bg-purple-500' },
                  { role: 'DISTRICT_OFFICIAL', count: 36, label: 'District Joint Directors (Animal Husbandry)', color: 'bg-amber-500' },
                  { role: 'STATE_ADMIN', count: 12, label: 'State Directorate & Commissioners', color: 'bg-rose-500' },
                  { role: 'SYSTEM_ADMIN', count: 4, label: 'IT Systems Architects & Security Admins', color: 'bg-slate-700' }
                ].map(r => (
                  <div key={r.role} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.role.replace('_', ' ')}</span>
                        <p className="text-[10px] text-slate-500">{r.label}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{r.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                User Management & Role-Based Access Control
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered veterinary stakeholders, assign role permissions, and view authentication states.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">User Profile</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Role & Privilege</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{u.phone}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {u.districtId ? `${u.districtId} (${u.stateId || 'MH'})` : 'National / State Level'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => store.switchRole(u.role)}
                        className="bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                        title="Simulate session as this user"
                      >
                        Impersonate Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RISK ENGINE RULES */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Epidemiological Surveillance Weights & Spatial Thresholds
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tune the multi-factor risk inference scoring algorithm in real time.
              </p>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Outbreak Cluster Radius (km)
              </label>
              <input
                type="number"
                value={config.clusterThresholds.radiusKm}
                onChange={e => setConfig({
                  ...config,
                  clusterThresholds: {
                    ...config.clusterThresholds,
                    radiusKm: parseFloat(e.target.value) || 10
                  }
                })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Quarantine enforcement radius applied around confirmed disease clusters.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cluster Minimum Cases Threshold
              </label>
              <input
                type="number"
                value={config.clusterThresholds.minCases}
                onChange={e => setConfig({
                  ...config,
                  clusterThresholds: {
                    ...config.clusterThresholds,
                    minCases: parseInt(e.target.value, 10) || 3
                  }
                })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Minimum positive or suspected cases within radius triggering cluster alert.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Symptom Match Risk Weight (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                value={config.riskWeights.symptomMatch}
                onChange={e => setConfig({
                  ...config,
                  riskWeights: {
                    ...config.riskWeights,
                    symptomMatch: parseFloat(e.target.value) || 0.3
                  }
                })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Algorithmic weight allocated to matching clinical symptom presentations.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Immutable Security & Surveillance Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically tracked log of clinical diagnoses, lab results, prescriptions, and official advisories.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { time: '2026-08-26 11:42:10', user: 'Dr. Anand Deshmukh (VETERINARIAN)', action: 'CASE_DIAGNOSED', details: 'Prescribed Penicillin & requested FMD PCR sample for Case #CASE-MH-2026-0042' },
              { time: '2026-08-26 10:15:00', user: 'Dr. Priya Kulkarni (LABORATORY_STAFF)', action: 'LAB_RESULT_CONFIRMED', details: 'Positive RT-PCR Capripoxvirus sample verified for Sample #SMP-2026-0089' },
              { time: '2026-08-26 09:30:22', user: 'Smt. Vandana Hegde (STATE_ADMIN)', action: 'ADVISORY_ISSUED', details: 'Statewide Ring Vaccination advisory broadcasted for Pune and Satara districts' },
              { time: '2026-08-26 08:12:45', user: 'Sunita Gaikwad (FIELD_WORKER)', action: 'OFFLINE_SYNC_COMPLETED', details: 'Uploaded 4 clinical field observations from Malegaon Budruk offline cache' },
              { time: '2026-08-26 07:05:18', user: 'Ramesh Patil (FARMER)', action: 'CASE_REPORTED', details: 'Logged high fever and oral vesicles for Tag #IN-MH-2024-00189' }
            ].map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{log.time}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.user}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                </div>
                <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-2 py-0.5 rounded">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & BACKUP */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Storage Engine & Database Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect client-side and cloud synchronization state, clear caches, or export full JSON surveillance dumps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Export National Surveillance Dump</h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Download a complete JSON snapshot of all herds, RFID animals, clinical cases, lab samples, and mortality reports.
              </p>
              <button
                onClick={() => {
                  const data = {
                    farms: store.getFarms(),
                    animals: store.getAnimals(),
                    cases: store.getCases(),
                    outbreaks: store.getOutbreaks(),
                    labSamples: store.getLabSamples(),
                    vaccinations: store.getVaccinations(),
                    treatments: store.getTreatments(),
                    mortality: store.getMortalityReports()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `livestockguard_surveillance_dump_${Date.now()}.json`;
                  a.click();
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Export JSON Dump
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Reset Surveillance Store</h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Restore all databases and configurations back to clean national outbreak seed status.
              </p>
              <button
                onClick={handleResetSeedData}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Reset Store Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
