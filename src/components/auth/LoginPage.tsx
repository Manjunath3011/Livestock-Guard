import React, { useState } from 'react';
import { store } from '../../services/store';
import { Role } from '../../types';
import { ROLE_DEFINITIONS } from '../../auth/roles';
import { RegisterWizard } from './RegisterWizard';
import { TrackStatusModal } from './TrackStatusModal';
import {
  Shield,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  X,
  Stethoscope,
  FlaskConical,
  Building2,
  Settings,
  Smartphone,
  UserCheck,
  UserPlus,
  Search,
  FileCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: (role: Role) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState('');
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // 7 Core Stakeholders with predefined demo credentials
  const demoAccounts: {
    role: Role;
    name: string;
    title: string;
    email: string;
    phone: string;
    icon: string;
    badgeColor: string;
    accentColor: string;
  }[] = [
    {
      role: 'FARMER',
      name: 'Ramesh Patil',
      title: 'Dairy & Livestock Farmer',
      email: 'farmer@livestockguard.gov.in',
      phone: '9822011223',
      icon: '👨🌾',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      accentColor: 'border-emerald-500 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
    },
    {
      role: 'FIELD_WORKER',
      name: 'Sunita Gaikwad',
      title: 'Field Worker / Para-Vet Officer',
      email: 'fieldworker@livestockguard.gov.in',
      phone: '9845033445',
      icon: '📱',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
      accentColor: 'border-teal-500 hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
    },
    {
      role: 'VETERINARIAN',
      name: 'Dr. Anand Deshmukh',
      title: 'Veterinary Officer (BVSc & AH)',
      email: 'vet@livestockguard.gov.in',
      phone: '9422055667',
      icon: '👨⚕️',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
      accentColor: 'border-blue-500 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
    },
    {
      role: 'LABORATORY_STAFF',
      name: 'Dr. Priya Kulkarni',
      title: 'Diagnostic Lab Pathologist',
      email: 'lab@livestockguard.gov.in',
      phone: '9890077889',
      icon: '🧪',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
      accentColor: 'border-purple-500 hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
    },
    {
      role: 'DISTRICT_OFFICIAL',
      name: 'Dr. Rajeshwar Sharma',
      title: 'Joint Director, Animal Husbandry',
      email: 'district@livestockguard.gov.in',
      phone: '9414099001',
      icon: '🏛️',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      accentColor: 'border-amber-500 hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
    },
    {
      role: 'STATE_ADMIN',
      name: 'Smt. Vandana Hegde',
      title: 'Animal Husbandry Commissioner',
      email: 'state@livestockguard.gov.in',
      phone: '9811022334',
      icon: '🏢',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
      accentColor: 'border-indigo-500 hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
    },
    {
      role: 'SYSTEM_ADMIN',
      name: 'Vikramjit Singh',
      title: 'IT Systems & Security Architect',
      email: 'admin@livestockguard.gov.in',
      phone: '9999000112',
      icon: '⚙️',
      badgeColor: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
      accentColor: 'border-slate-500 hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
    }
  ];

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = store.login(identifier, password);
      setIsLoading(false);
      if (result.success && result.user) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user.role);
        }
      } else {
        setErrorMessage(result.error || 'Invalid credentials. Please try again.');
      }
    }, 200);
  };

  const handleQuickLogin = (role: Role) => {
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = store.loginAsRole(role);
      setIsLoading(false);
      if (result.success && result.user) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user.role);
        }
      } else {
        setErrorMessage(result.error || 'Failed to authenticate user.');
      }
    }, 150);
  };

  const handleEnterDemo = (role: Role = 'FARMER') => {
    store.enterDemoMode(role);
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSuccess(false);
      setForgotInput('');
    }, 2500);
  };

  if (viewMode === 'REGISTER') {
    return (
      <>
        <RegisterWizard
          onBackToLogin={() => setViewMode('LOGIN')}
          onTrackStatus={(id) => {
            setTrackInitialId(id || '');
            setIsTrackModalOpen(true);
          }}
          onRegistrationSuccess={(req) => {
            if (req.status === 'VERIFIED') {
              // Pre-fill identifier if verified
              setIdentifier(req.phone || req.email || '');
            }
          }}
        />
        <TrackStatusModal
          isOpen={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
          initialQuery={trackInitialId}
          onSignIn={() => {
            setIsTrackModalOpen(false);
            setViewMode('LOGIN');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Gov Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                  LIVESTOCK<span className="text-emerald-600 dark:text-emerald-400">GUARD</span>
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md uppercase border border-emerald-300 dark:border-emerald-800">
                  National AH Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                Integrated National Animal Disease Early Warning & Biosecurity Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Toll-Free:</span> 1800-419-VET
            </button>

            <button
              onClick={() => handleEnterDemo('FARMER')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
              title="Launch Sandbox Demo without logging in"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Sandbox</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Official Authentication Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-3">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Secure Access</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sign In to LivestockGuard
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Access your role-authorized command center, surveillance tools, and biosecurity registry.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="grow font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                {/* Mobile Number / Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. vet@livestockguard.gov.in or 9422055667"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Enter your registered 10-digit mobile number or government email.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Keep me signed in
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need Help?</span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs tracking-wide shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Registration Workflow Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    New to LivestockGuard?
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('REGISTER')}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-extrabold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Account</span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTrackInitialId('');
                      setIsTrackModalOpen(true);
                    }}
                    className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Registration Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
                  >
                    Verification Help
                  </button>
                </div>
              </div>

              {/* Security Footnote */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Protected by 256-bit biosecurity encryption & role-based access control.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 7 Official Test Role Personas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    <UserCheck className="w-4 h-4" />
                    Role-Based Access Control (RBAC)
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Authorized Stakeholder Accounts (1-Click Login)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click any stakeholder below to authenticate instantly with their verified database profile and scoped dashboard.
                  </p>
                </div>
              </div>

              {/* Grid of 7 Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {demoAccounts.map(acc => {
                  const meta = ROLE_DEFINITIONS[acc.role] || ROLE_DEFINITIONS.FARMER;
                  return (
                    <div
                      key={acc.role}
                      onClick={() => handleQuickLogin(acc.role)}
                      className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs group ${acc.accentColor}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                            {acc.icon}
                          </span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{acc.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
                              {acc.title}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${acc.badgeColor} shrink-0`}>
                          {meta.displayName}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-slate-400">ID:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[140px]">{acc.email}</span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-slate-400">Phone:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold">{acc.phone}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(acc.role);
                        }}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Log in as {meta.shortLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Demo Sandbox Banner */}
              <div className="p-4 bg-linear-to-r from-amber-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 rounded-2xl border border-amber-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Need to test multiple roles simultaneously?
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Use the Demo Sandbox to switch roles on the fly without logging in and out.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEnterDemo('FARMER')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-all cursor-pointer"
                >
                  Launch Demo Mode
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Reset Password / Account Recovery
                </h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Password Reset Link & OTP Sent!
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Please check your registered SMS and email for verification instructions.
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered mobile number or email. We will send a secure verification code to reset your password.
                </p>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={e => setForgotInput(e.target.value)}
                  placeholder="e.g. 9822011223 or vet@livestockguard.gov.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Need Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  LivestockGuard Support & Helpdesk
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">📞 24x7 Veterinary Toll-Free Helpline:</div>
                <div className="text-emerald-600 font-extrabold text-sm">1800-419-VET (1800-419-838)</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">✉️ Helpdesk Email Support:</div>
                <div className="text-slate-600 dark:text-slate-300 font-mono">support@livestockguard.gov.in</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">📱 IVR Voice Reporting Gateway:</div>
                <div className="text-slate-600 dark:text-slate-300">Dial 1800-419-838 and press 1 to report an urgent livestock disease alert.</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Registration Status Modal */}
      <TrackStatusModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialQuery={trackInitialId}
        onSignIn={() => {
          setIsTrackModalOpen(false);
          setViewMode('LOGIN');
        }}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            LivestockGuard • Department of Animal Husbandry & Dairying
          </div>
          <div className="text-[11px] text-slate-400">
            Version 2.4.0 (Enterprise Production Build)
          </div>
        </div>
      </footer>
    </div>
  );
};
