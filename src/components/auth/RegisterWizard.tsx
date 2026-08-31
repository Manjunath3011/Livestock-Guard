import React, { useState, useEffect } from 'react';
import { Role, Species, LanguageCode, AccountStatus, RegistrationRequest } from '../../types';
import { NormalizedLocationSelection } from '../../types/location';
import { registrationService, RegisterUserInput } from '../../services/registrationService';
import { IndiaLocationPicker } from '../common/IndiaLocationPicker';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  FileCheck,
  Building2,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  MapPin,
  Stethoscope,
  FlaskConical,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Clock,
  ExternalLink,
  Trash2,
  KeyRound,
  Check,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterWizardProps {
  onBackToLogin: () => void;
  onTrackStatus: (initialQuery?: string) => void;
  onRegistrationSuccess?: (request: RegistrationRequest) => void;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({
  onBackToLogin,
  onTrackStatus,
  onRegistrationSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<Role>('FARMER');

  // Step 2: Personal & Location
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('en');
  const [stateId, setStateId] = useState('st_in_mh');
  const [stateName, setStateName] = useState('Maharashtra');
  const [districtId, setDistrictId] = useState('dt_in_mh_pune');
  const [districtName, setDistrictName] = useState('Pune');
  const [subDistrictId, setSubDistrictId] = useState('sd_in_mh_pune_baramati');
  const [blockName, setBlockName] = useState('Baramati');
  const [villageId, setVillageId] = useState('vl_in_mh_pune_baramati_malegaon_bk');
  const [villageName, setVillageName] = useState('Malegaon Budruk');
  const [pincode, setPincode] = useState('413115');
  const [addressLine, setAddressLine] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: 18.1524, longitude: 74.5768 });

  // Role Specific Fields
  // Farmer
  const [farmName, setFarmName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>(['Cattle', 'Buffalo']);
  const [animalCount, setAnimalCount] = useState<number>(12);
  const [farmAddress, setFarmAddress] = useState('');

  // Field Worker
  const [fwOrg, setFwOrg] = useState('Department of Animal Husbandry, Sub-Division Baramati');
  const [fwEmployeeId, setFwEmployeeId] = useState('FW-MH-2026-89');
  const [fwExperience, setFwExperience] = useState<number>(5);
  const [fwArea, setFwArea] = useState('Baramati & Daund Blocks');

  // Veterinarian
  const [vetOrg, setVetOrg] = useState('District Veterinary Polyclinic & Hospital, Pune');
  const [vetQualification, setVetQualification] = useState('BVSc & AH, MVSc (Medicine)');
  const [vetRegNumber, setVetRegNumber] = useState('MAH-VC-89941');
  const [vetAuthority, setVetAuthority] = useState('Maharashtra State Veterinary Council');
  const [vetValidity, setVetValidity] = useState('2029-12-31');

  // Diagnostic Lab
  const [labName, setLabName] = useState('Apex Veterinary Diagnostic Reference Laboratory');
  const [labContactPerson, setLabContactPerson] = useState('');
  const [labType, setLabType] = useState('Regional Animal Disease Diagnostic Laboratory');
  const [labAccreditationNo, setLabAccreditationNo] = useState('NABL-TC-2026-441');
  const [labOrg, setLabOrg] = useState('State Animal Health Directorate / Accredited Private');
  const [labAddress, setLabAddress] = useState('Biotechnology Park, Phase 1, Hinjawadi, Pune');

  // District / State Official
  const [officialDept, setOfficialDept] = useState('Directorate of Animal Husbandry, Govt. of Maharashtra');
  const [officialDesignation, setOfficialDesignation] = useState('Joint Director (Epidemiology & Biosecurity)');
  const [officialEmployeeId, setOfficialEmployeeId] = useState('GOV-MH-AH-JD04');
  const [officialOffice, setOfficialOffice] = useState('Animal Husbandry Directorate, Central Building, Pune');
  const [officialDirectorate, setOfficialDirectorate] = useState('Directorate of Animal Husbandry');

  // Step 3: OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [simulatedSmsOtp, setSimulatedSmsOtp] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Step 4: Documents Upload
  const [uploadedFiles, setUploadedFiles] = useState<{
    type: 'GOV_ID' | 'VET_LICENSE' | 'LAB_ACCREDITATION' | 'OFFICE_ID' | 'APPOINTMENT_LETTER' | 'CERTIFICATE';
    name: string;
    size: number;
    mimeType: string;
    previewUrl?: string;
  }[]>([]);

  // Step 5: Consent
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [consentApproval, setConsentApproval] = useState(false);
  const [consentServices, setConsentServices] = useState(false);

  // Submission result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    requestId: string;
    status: AccountStatus;
    request?: RegistrationRequest;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step Validation Messages
  const [stepError, setStepError] = useState<string | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle Send OTP
  const handleSendOtp = () => {
    setOtpError(null);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number in Step 2.');
      return;
    }

    const res = registrationService.sendMobileOtp(phone);
    if (res.success) {
      setIsOtpSent(true);
      setSimulatedSmsOtp(res.simulatedCode);
      setOtpTimer(60);
    } else {
      setOtpError(res.message);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    setOtpError(null);
    if (!otpCode.trim()) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    const res = registrationService.verifyMobileOtp(phone, otpCode);
    if (res.success) {
      setIsPhoneVerified(true);
      setSimulatedSmsOtp(null);
    } else {
      setOtpError(res.message);
    }
  };

  // Handle Simulated File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc = {
        type: docType,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/pdf',
        previewUrl: URL.createObjectURL(file)
      };
      setUploadedFiles(prev => [...prev.filter(f => f.type !== docType), newDoc]);
    }
  };

  const handleSimulatedDocAdd = (docType: any, sampleName: string) => {
    const newDoc = {
      type: docType,
      name: sampleName,
      size: 1024 * 1024 * 1.5, // 1.5 MB
      mimeType: sampleName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
    };
    setUploadedFiles(prev => [...prev.filter(f => f.type !== docType), newDoc]);
  };

  // Toggle Species for Farmer
  const toggleSpecies = (sp: Species) => {
    if (selectedSpecies.includes(sp)) {
      if (selectedSpecies.length > 1) {
        setSelectedSpecies(selectedSpecies.filter(s => s !== sp));
      }
    } else {
      setSelectedSpecies([...selectedSpecies, sp]);
    }
  };

  // Validate Current Step before Moving Next
  const handleNextStep = () => {
    setStepError(null);

    if (currentStep === 1) {
      // Role selected
      if (!selectedRole) {
        setStepError('Please select your account role.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Validate Personal Info
      if (!fullName.trim()) {
        setStepError('Please enter your Full Name.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setStepError('Please enter a valid 10-digit mobile number.');
        return;
      }

      // Role specific validation
      if (selectedRole === 'VETERINARIAN') {
        if (!vetRegNumber.trim()) {
          setStepError('Veterinary registration number (VCI / State Council) is mandatory.');
          return;
        }
      }
      if (selectedRole === 'DIAGNOSTIC_LAB') {
        if (!labName.trim()) {
          setStepError('Laboratory name is required.');
          return;
        }
      }
      if (selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN') {
        if (!officialEmployeeId.trim()) {
          setStepError('Government Employee / Officer ID is required.');
          return;
        }
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // Must have verified mobile OTP
      if (!isPhoneVerified) {
        setStepError('You must verify your mobile number via OTP before proceeding.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      // Documents upload (mandatory for privileged roles)
      const isPrivileged = selectedRole !== 'FARMER';
      if (isPrivileged && uploadedFiles.length === 0) {
        setStepError('Please upload at least one required credential/identity document for regulatory verification.');
        return;
      }
      setCurrentStep(5);
      return;
    }
  };

  // Submit Final Registration
  const handleSubmitRegistration = () => {
    if (!consentAccuracy || !consentApproval || !consentServices) {
      setStepError('Please acknowledge all mandatory consent and policy checkboxes before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: RegisterUserInput = {
      role: selectedRole,
      fullName,
      phone,
      email: email || undefined,
      password: password || undefined,
      stateId,
      stateName,
      districtId,
      districtName,
      blockName,
      villageName,
      preferredLanguage,
      farmDetails: selectedRole === 'FARMER' ? {
        farmName: farmName || `${fullName}'s Farm`,
        species: selectedSpecies,
        animalCount: Number(animalCount) || 10,
        locationAddress: farmAddress || addressLine || `${villageName}, ${blockName}, ${districtName} - ${pincode}`
      } : undefined,
      fieldWorkerDetails: selectedRole === 'FIELD_WORKER' ? {
        organization: fwOrg,
        employeeId: fwEmployeeId,
        yearsOfExperience: fwExperience,
        areaOfOperation: fwArea
      } : undefined,
      vetDetails: selectedRole === 'VETERINARIAN' ? {
        organization: vetOrg,
        qualification: vetQualification,
        regNumber: vetRegNumber,
        councilAuthority: vetAuthority,
        regValidityDate: vetValidity
      } : undefined,
      labDetails: selectedRole === 'DIAGNOSTIC_LAB' || selectedRole === 'LABORATORY_STAFF' ? {
        laboratoryName: labName,
        laboratoryType: labType,
        accreditationNumber: labAccreditationNo,
        organization: labOrg,
        address: labAddress
      } : undefined,
      officialDetails: (selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN') ? {
        department: officialDept,
        designation: officialDesignation,
        employeeId: officialEmployeeId,
        officeAddress: officialOffice,
        directorate: officialDirectorate
      } : undefined,
      isPhoneVerified: true,
      isEmailVerified,
      documents: uploadedFiles
    };

    setTimeout(() => {
      const result = registrationService.registerUser(payload);
      setIsSubmitting(false);

      if (result.success && result.requestId) {
        setSubmissionResult({
          success: true,
          requestId: result.requestId,
          status: result.status,
          request: result.request
        });

        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch {}

        if (onRegistrationSuccess && result.request) {
          onRegistrationSuccess(result.request);
        }
      } else {
        setErrorMessage(result.error || 'Failed to submit registration. Please try again.');
      }
    }, 600);
  };

  const handleCopyRequestId = () => {
    if (submissionResult?.requestId) {
      navigator.clipboard.writeText(submissionResult.requestId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // If already submitted successfully, render the official Success Screen
  if (submissionResult) {
    const isFarmer = selectedRole === 'FARMER';
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto w-full my-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            {/* Header Icon */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registration Submitted Successfully
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your account registration has been logged with the National Animal Health Surveillance Network.
              </p>
            </div>

            {/* Registration Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Registration Reference ID
                  </div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-2">
                    <span>{submissionResult.requestId}</span>
                    <button
                      onClick={handleCopyRequestId}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy Reference ID"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Requested Role
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedRole.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Verification Status
                  </div>
                  <div className="mt-1">
                    {submissionResult.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        VERIFIED & ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        PENDING VERIFICATION
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <span>Applicant: </span>
                  <strong className="text-slate-900 dark:text-white">{fullName}</strong>
                </div>
              </div>
            </div>

            {/* Informational Message */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                {isFarmer ? (
                  <p>
                    Your mobile number is verified. You can sign in immediately to record livestock health reports, request veterinary visits, and monitor local biosecurity alerts.
                  </p>
                ) : (
                  <p>
                    Your professional and organizational credentials have been routed to the state veterinary regulatory queue. Once authorized, your privileged command center will be activated.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onBackToLogin}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>

              <button
                onClick={() => onTrackStatus(submissionResult.requestId)}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Registration Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 6 Self-Registerable Roles (Strictly NO System Admin per specification)
  const roleCards: {
    role: Role;
    title: string;
    icon: string;
    desc: string;
    verificationNote: string;
    accentClass: string;
  }[] = [
    {
      role: 'FARMER',
      title: 'Farmer / Livestock Owner',
      icon: '👨🌾',
      desc: 'Register livestock herd, record health events, receive early bio-alerts',
      verificationNote: 'Instant Mobile OTP Verification',
      accentClass: 'border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
    },
    {
      role: 'FIELD_WORKER',
      title: 'Field Worker / Para-Vet',
      icon: '📱',
      desc: 'Field diagnostics, village vaccinations, outbreak containment visits',
      verificationNote: 'Department / Para-Vet ID Verification',
      accentClass: 'border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
    },
    {
      role: 'VETERINARIAN',
      title: 'Veterinarian (BVSc & AH)',
      icon: '👨⚕️',
      desc: 'Clinical evaluations, treatments, lab sample orders, telemedicine',
      verificationNote: 'VCI / State Veterinary Council Verification',
      accentClass: 'border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
    },
    {
      role: 'DIAGNOSTIC_LAB',
      title: 'Diagnostic Laboratory',
      icon: '🧪',
      desc: 'Sample pathology, PCR assays, confirmatory lab reports',
      verificationNote: 'NABL / State Accreditation Verification',
      accentClass: 'border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
    },
    {
      role: 'DISTRICT_OFFICIAL',
      title: 'District Animal Health Official',
      icon: '🏛️',
      desc: 'District surveillance, epidemic monitoring, containment zoning',
      verificationNote: 'Government Official ID & Approval',
      accentClass: 'border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
    },
    {
      role: 'STATE_ADMIN',
      title: 'State Admin / Directorate',
      icon: '🏢',
      desc: 'State biosecurity directives, macro epidemiology, policy controls',
      verificationNote: 'State Directorate Institutional Clearance',
      accentClass: 'border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-2xs backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                  Registration
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                National Animal Disease Surveillance & Identity Verification System
              </p>
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        
        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Your LivestockGuard Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-1 font-medium">
            Register securely to access animal-health surveillance and decision-support services.
          </p>
        </div>

        {/* 5-Step Stepper Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
            
            {[
              { num: 1, label: 'Account Type' },
              { num: 2, label: 'Identity' },
              { num: 3, label: 'Contact Verification' },
              { num: 4, label: 'Role Verification' },
              { num: 5, label: 'Review & Submit' }
            ].map(s => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950 font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold hidden md:block ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            Step {currentStep} of 5 — {
              currentStep === 1 ? 'Select Account Type' :
              currentStep === 2 ? 'Personal & Location Details' :
              currentStep === 3 ? 'Contact Verification (Mobile OTP)' :
              currentStep === 4 ? 'Professional Role Verification' : 'Review & Submit Registration'
            }
          </div>
        </div>

        {/* Step Error Banner */}
        {stepError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-xs font-semibold text-red-800 dark:text-red-300">
              {stepError}
            </span>
          </div>
        )}

        {/* Step 1: Account Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Who are you?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the primary operational role that represents your livestock or veterinary practice.
                </p>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleCards.map(item => {
                  const isSelected = selectedRole === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => setSelectedRole(item.role)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? `${item.accentClass} bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/30`
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                            {item.icon}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{item.verificationNote}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* System Admin Notice */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>System Security Policy:</strong> System Administrator accounts cannot be self-registered. System Admin access can only be provisioned by authorized state IT directorates.
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identity & Location Details */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Role: {selectedRole.replace('_', ' ')}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Personal & Location Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Provide your accurate identity and jurisdictional coordinates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name (as per Govt ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Amit Sharma / Ramesh Patil"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number (for OTP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98220 11223"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Email Address {selectedRole !== 'FARMER' ? <span className="text-red-500">*</span> : '(Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN' ? 'officer@gov.in' : 'user@domain.com'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Portal Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            {/* Pan-India Location Picker */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <IndiaLocationPicker
                value={{
                  stateId,
                  districtId,
                  subDistrictId,
                  villageId,
                  pincode,
                  addressLine,
                  coordinates
                }}
                onChange={(selection: NormalizedLocationSelection) => {
                  setStateId(selection.stateId);
                  setStateName(selection.stateName);
                  setDistrictId(selection.districtId);
                  setDistrictName(selection.districtName);
                  setSubDistrictId(selection.subDistrictId);
                  setBlockName(selection.subDistrictName);
                  setVillageId(selection.villageId);
                  setVillageName(selection.villageName);
                  setPincode(selection.pincode);
                  if (selection.addressLine !== undefined) {
                    setAddressLine(selection.addressLine);
                  }
                  if (selection.coordinates) {
                    setCoordinates(selection.coordinates);
                  }
                }}
                language={preferredLanguage}
                label="Geographical Jurisdiction & Address"
              />
            </div>

            {/* Role Specific Extra Details */}
            {selectedRole === 'FARMER' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Livestock & Herd Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Farm / Herd Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={e => setFarmName(e.target.value)}
                      placeholder="e.g. Patil Dairy Farm"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Approximate Number of Animals
                    </label>
                    <input
                      type="number"
                      value={animalCount}
                      onChange={e => setAnimalCount(Number(e.target.value))}
                      min="1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Species Raised on Farm (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Pig'] as Species[]).map(sp => {
                      const isSel = selectedSpecies.includes(sp);
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => toggleSpecies(sp)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'VETERINARIAN' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Veterinary Professional Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Veterinary Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vetRegNumber}
                      onChange={e => setVetRegNumber(e.target.value)}
                      placeholder="e.g. MAH-VC-88421 / VCI-09941"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Registration Authority <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vetAuthority}
                      onChange={e => setVetAuthority(e.target.value)}
                      placeholder="e.g. Maharashtra State Veterinary Council"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Veterinary Qualification
                    </label>
                    <input
                      type="text"
                      value={vetQualification}
                      onChange={e => setVetQualification(e.target.value)}
                      placeholder="e.g. BVSc & AH / MVSc"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Clinical Organization / Hospital
                    </label>
                    <input
                      type="text"
                      value={vetOrg}
                      onChange={e => setVetOrg(e.target.value)}
                      placeholder="e.g. Pune Veterinary Polyclinic"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'FIELD_WORKER' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Field Worker / Para-Vet Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Organization / Department
                    </label>
                    <input
                      type="text"
                      value={fwOrg}
                      onChange={e => setFwOrg(e.target.value)}
                      placeholder="e.g. Dept of Animal Husbandry"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Employee / Worker ID
                    </label>
                    <input
                      type="text"
                      value={fwEmployeeId}
                      onChange={e => setFwEmployeeId(e.target.value)}
                      placeholder="e.g. FW-PUN-089"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'DIAGNOSTIC_LAB' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Diagnostic Laboratory Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Laboratory Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={labName}
                      onChange={e => setLabName(e.target.value)}
                      placeholder="e.g. Regional Disease Diagnostic Lab"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Accreditation / Registration ID
                    </label>
                    <input
                      type="text"
                      value={labAccreditationNo}
                      onChange={e => setLabAccreditationNo(e.target.value)}
                      placeholder="e.g. NABL-TC-8891"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN') && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Government Department & Officer Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Government Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={officialDesignation}
                      onChange={e => setOfficialDesignation(e.target.value)}
                      placeholder="e.g. Joint Director (Animal Health)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Employee / Officer ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={officialEmployeeId}
                      onChange={e => setOfficialEmployeeId(e.target.value)}
                      placeholder="e.g. GOV-MH-AH-JD01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Step 3 (OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Verification (Mobile OTP) */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Contact Verification (Mobile OTP)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verify your registered mobile number via a secure one-time password.
              </p>
            </div>

            {/* Verification Box */}
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value={phone}
                    className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isPhoneVerified || otpTimer > 0}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
                  >
                    {isPhoneVerified ? 'Verified' : isOtpSent ? (otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Resend OTP') : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* Simulated SMS Alert for Testing */}
              {simulatedSmsOtp && !isPhoneVerified && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-[11px] text-emerald-900 dark:text-emerald-300">
                      <span>SMS Code: </span>
                      <strong className="font-mono text-sm tracking-wider text-emerald-700 dark:text-emerald-400">{simulatedSmsOtp}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(simulatedSmsOtp)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400 cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* OTP Input */}
              {isOtpSent && !isPhoneVerified && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {/* Error in OTP */}
              {otpError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </p>
              )}

              {/* Verified Badge */}
              {isPhoneVerified && (
                <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>✓ Mobile Number Verified</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Your phone number {phone} is authenticated with two-factor cryptographic token.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!isPhoneVerified}
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Step 4</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Role Verification & Documents */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Regulatory Clearance
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Upload Identity & Credential Documents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedRole === 'FARMER'
                  ? 'Optional: Upload livestock registration or farm ownership proof for advanced farm bio-insurance.'
                  : `Upload official credentials to substantiate your requested ${selectedRole.replace('_', ' ')} authority.`}
              </p>
            </div>

            {/* Document Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Upload Identity / Credential Document
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Accepted formats: PDF, JPG, PNG (Max 10MB per file)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {/* Sample 1-click test document loaders for fast verification */}
                  {selectedRole === 'VETERINARIAN' && (
                    <button
                      type="button"
                      onClick={() => handleSimulatedDocAdd('VET_LICENSE', 'VCI_Registration_Certificate_Deshmukh.pdf')}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold border border-blue-300 dark:border-blue-800 cursor-pointer"
                    >
                      + Attach Sample VCI Certificate
                    </button>
                  )}
                  {selectedRole === 'FIELD_WORKER' && (
                    <button
                      type="button"
                      onClick={() => handleSimulatedDocAdd('OFFICE_ID', 'Dept_Animal_Husbandry_ID_Card.jpg')}
                      className="px-3 py-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[11px] font-bold border border-teal-300 dark:border-teal-800 cursor-pointer"
                    >
                      + Attach Sample Para-Vet ID
                    </button>
                  )}
                  {selectedRole === 'DIAGNOSTIC_LAB' && (
                    <button
                      type="button"
                      onClick={() => handleSimulatedDocAdd('LAB_ACCREDITATION', 'NABL_Veterinary_Scope_Scope2026.pdf')}
                      className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[11px] font-bold border border-purple-300 dark:border-purple-800 cursor-pointer"
                    >
                      + Attach Sample NABL Certificate
                    </button>
                  )}
                  {(selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN') && (
                    <button
                      type="button"
                      onClick={() => handleSimulatedDocAdd('OFFICE_ID', 'Gov_Official_Posting_Order_AH.pdf')}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800 cursor-pointer"
                    >
                      + Attach Official Posting Order
                    </button>
                  )}
                  {selectedRole === 'FARMER' && (
                    <button
                      type="button"
                      onClick={() => handleSimulatedDocAdd('GOV_ID', 'Livestock_Holding_Registry_Baramati.pdf')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                    >
                      + Attach Sample Farm Record
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded Documents List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Uploaded Documents ({uploadedFiles.length})
                  </h4>
                  {uploadedFiles.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {(doc.size / (1024 * 1024)).toFixed(2)} MB • {doc.type} • 🔒 Encrypted
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Security Footnote */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Security Guarantee:</strong> Your document is used only for statutory credential verification. It is stored in an encrypted vault, accessible only to authorized regulatory officers, and never exposed publicly.
                </p>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Step 5 (Review)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Review & Submit Registration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verify your submitted registration parameters before official logging.
              </p>
            </div>

            {/* Structured Summary Table */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Name:</span>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">
                    {fullName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Role Requested:</span>
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                    {selectedRole.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Mobile Number:</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <span>{phone}</span>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Email:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {email || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Jurisdiction:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {villageName}, {blockName}, {districtName}, {stateName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Professional Credentials:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRole === 'VETERINARIAN' && `Reg #${vetRegNumber} (${vetAuthority})`}
                    {selectedRole === 'FIELD_WORKER' && `Emp #${fwEmployeeId} (${fwOrg})`}
                    {selectedRole === 'DIAGNOSTIC_LAB' && `${labName} (Accreditation: ${labAccreditationNo})`}
                    {(selectedRole === 'DISTRICT_OFFICIAL' || selectedRole === 'STATE_ADMIN') && `${officialDesignation} (ID: ${officialEmployeeId})`}
                    {selectedRole === 'FARMER' && `${selectedSpecies.join(', ')} (${animalCount} animals)`}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Status after submission:
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {selectedRole === 'FARMER' ? 'INSTANT ACTIVATION' : 'PENDING VERIFICATION'}
                </span>
              </div>
            </div>

            {/* Mandatory Consent Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccuracy}
                  onChange={e => setConsentAccuracy(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  I confirm that the information and professional credentials provided are accurate and verifiable.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentApproval}
                  onChange={e => setConsentApproval(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  I understand that privileged role access requires official regulatory review and authorization before activation.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentServices}
                  onChange={e => setConsentServices(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  I consent to the use of my contact information for account verification and LivestockGuard animal-health services under national data policies.
                </span>
              </label>
            </div>

            {/* Policy Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="hover:text-emerald-600 underline cursor-pointer">
                Privacy Policy
              </span>
              <span>•</span>
              <span className="hover:text-emerald-600 underline cursor-pointer">
                Terms of Use
              </span>
              <span>•</span>
              <span className="hover:text-emerald-600 underline cursor-pointer">
                Data Handling & Retention Policy
              </span>
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </p>
            )}

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting || !consentAccuracy || !consentApproval || !consentServices}
                onClick={handleSubmitRegistration}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 National Animal Health Surveillance & Biosecurity Network. All rights reserved.</p>
      </footer>
    </div>
  );
};
