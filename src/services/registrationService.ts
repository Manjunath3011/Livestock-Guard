import {
  User,
  Role,
  AccountStatus,
  RegistrationRequest,
  VerificationDocument,
  RegistrationAuditLog,
  Species,
  LanguageCode
} from '../types';
import { store } from './store';

const REG_STORAGE_KEYS = {
  REQUESTS: 'lg_registration_requests',
  DOCS: 'lg_verification_docs',
  AUDIT: 'lg_reg_audit_logs',
  OTPS: 'lg_active_otps'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Storage error for ${key}:`, e);
  }
}

// Initial realistic seed registrations across all statuses
const SEED_REGISTRATIONS: RegistrationRequest[] = [
  {
    id: 'LG-REG-781042',
    userId: 'usr_reg_vet_02',
    fullName: 'Dr. Sneha Roy',
    phone: '+91 98223 99441',
    email: 'sneha.roy@punevet.org',
    requestedRole: 'VETERINARIAN',
    accountTypeLabel: 'Veterinarian (BVSc & AH)',
    status: 'PENDING_VERIFICATION',
    stateId: 'st_mah',
    stateName: 'Maharashtra',
    districtId: 'dt_pune',
    districtName: 'Pune',
    blockName: 'Baramati',
    villageName: 'Malegaon',
    preferredLanguage: 'en',
    vetDetails: {
      organization: 'Pune Veterinary Clinical Centre',
      qualification: 'BVSc & AH (Nagpur Veterinary College)',
      regNumber: 'MAH-VC-99120',
      councilAuthority: 'Maharashtra State Veterinary Council',
      regValidityDate: '2029-12-31'
    },
    isPhoneVerified: true,
    isEmailVerified: true,
    documents: [
      {
        id: 'doc_vet_01',
        documentType: 'VET_LICENSE',
        documentName: 'VCI_Registration_Certificate.pdf',
        fileName: 'VCI_Registration_Certificate.pdf',
        fileSize: 1428500,
        mimeType: 'application/pdf',
        secureStorageReference: 'sec_store://credentials/vci_mah_99120_enc.pdf',
        verificationStatus: 'PENDING',
        uploadedAt: '2026-08-24T14:32:00Z',
        retentionExpiry: '2027-08-24T00:00:00Z'
      }
    ],
    submittedAt: '2026-08-24T14:35:00Z'
  },
  {
    id: 'LG-REG-652391',
    userId: 'usr_reg_fw_02',
    fullName: 'Anil Kadam',
    phone: '+91 97654 22109',
    email: 'anil.kadam@ahfield.gov.in',
    requestedRole: 'FIELD_WORKER',
    accountTypeLabel: 'Field Worker / Para-Vet',
    status: 'UNDER_REVIEW',
    stateId: 'st_mah',
    stateName: 'Maharashtra',
    districtId: 'dt_pune',
    districtName: 'Pune',
    blockName: 'Indapur',
    villageName: 'Bawda',
    preferredLanguage: 'hi',
    fieldWorkerDetails: {
      organization: 'Department of Animal Husbandry, Sub-division Indapur',
      employeeId: 'FW-PUN-089',
      yearsOfExperience: 6,
      areaOfOperation: 'Indapur & Daund Blocks'
    },
    isPhoneVerified: true,
    isEmailVerified: false,
    documents: [
      {
        id: 'doc_fw_01',
        documentType: 'OFFICE_ID',
        documentName: 'ParaVet_Dept_ID_Card.jpg',
        fileName: 'ParaVet_Dept_ID_Card.jpg',
        fileSize: 842000,
        mimeType: 'image/jpeg',
        secureStorageReference: 'sec_store://credentials/fw_pun_089.jpg',
        verificationStatus: 'PENDING',
        uploadedAt: '2026-08-23T09:15:00Z',
        retentionExpiry: '2027-08-23T00:00:00Z'
      }
    ],
    submittedAt: '2026-08-23T09:20:00Z',
    reviewedAt: '2026-08-24T11:00:00Z',
    reviewerName: 'Dr. Rajeshwar Sharma (Joint Director AH)',
    reviewNotes: 'Identity confirmed with Indapur sub-divisional officer. Pending certificate cross-check.'
  },
  {
    id: 'LG-REG-549112',
    userId: 'usr_reg_lab_02',
    fullName: 'Dr. Meenakshi Sunderam',
    phone: '+91 98840 55112',
    email: 'director@biogendiagnostics.co.in',
    requestedRole: 'LABORATORY_STAFF',
    accountTypeLabel: 'Diagnostic Laboratory',
    status: 'MORE_INFORMATION_REQUIRED',
    stateId: 'st_mah',
    stateName: 'Maharashtra',
    districtId: 'dt_pune',
    districtName: 'Pune',
    preferredLanguage: 'en',
    labDetails: {
      laboratoryName: 'BioGen Veterinary Diagnostic & Molecular Lab',
      laboratoryType: 'Regional Reference / Private Accredited',
      accreditationNumber: 'NABL-TC-8891-2025',
      organization: 'BioGen Life Sciences Ltd',
      address: 'Phase 2, Hinjawadi Biotech Park, Pune - 411057'
    },
    isPhoneVerified: true,
    isEmailVerified: true,
    documents: [
      {
        id: 'doc_lab_01',
        documentType: 'LAB_ACCREDITATION',
        documentName: 'NABL_Scope_Certificate.pdf',
        fileName: 'NABL_Scope_Certificate.pdf',
        fileSize: 2450000,
        mimeType: 'application/pdf',
        secureStorageReference: 'sec_store://credentials/nabl_tc_8891.pdf',
        verificationStatus: 'PENDING',
        uploadedAt: '2026-08-22T16:00:00Z',
        retentionExpiry: '2027-08-22T00:00:00Z'
      }
    ],
    submittedAt: '2026-08-22T16:05:00Z',
    reviewedAt: '2026-08-24T15:30:00Z',
    reviewerName: 'Dr. Rajeshwar Sharma',
    reviewNotes: 'Please upload Annexure B (Serology & PCR testing scope certification).'
  },
  {
    id: 'LG-REG-901428',
    userId: 'usr_reg_dist_02',
    fullName: 'Dr. Kavita Deshmukh',
    phone: '+91 94231 66789',
    email: 'kavita.deshmukh@gov.in',
    requestedRole: 'DISTRICT_OFFICIAL',
    accountTypeLabel: 'District Animal Health Official',
    status: 'PENDING_VERIFICATION',
    stateId: 'st_mah',
    stateName: 'Maharashtra',
    districtId: 'dt_pune',
    districtName: 'Pune',
    preferredLanguage: 'en',
    officialDetails: {
      department: 'Directorate of Animal Husbandry, Govt of Maharashtra',
      designation: 'Deputy Director (Disease Surveillance)',
      employeeId: 'MAH-AH-DD-042',
      officeAddress: 'Central Building, Station Road, Pune 411001',
      directorate: 'Animal Husbandry & Dairy Development'
    },
    isPhoneVerified: true,
    isEmailVerified: true,
    documents: [
      {
        id: 'doc_dist_01',
        documentType: 'OFFICE_ID',
        documentName: 'Gov_Official_Posting_Order.pdf',
        fileName: 'Gov_Official_Posting_Order.pdf',
        fileSize: 1890000,
        mimeType: 'application/pdf',
        secureStorageReference: 'sec_store://credentials/gov_ah_dd_042.pdf',
        verificationStatus: 'PENDING',
        uploadedAt: '2026-08-25T11:20:00Z',
        retentionExpiry: '2027-08-25T00:00:00Z'
      }
    ],
    submittedAt: '2026-08-25T11:25:00Z'
  }
];

export interface RegisterUserInput {
  role: Role;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  blockName?: string;
  villageName?: string;
  preferredLanguage: LanguageCode;
  
  // Role specific
  farmDetails?: {
    farmName?: string;
    species: Species[];
    animalCount: number;
    locationAddress?: string;
  };
  fieldWorkerDetails?: {
    organization: string;
    employeeId?: string;
    yearsOfExperience?: number;
    areaOfOperation?: string;
  };
  vetDetails?: {
    organization: string;
    qualification: string;
    regNumber: string;
    councilAuthority: string;
    regValidityDate?: string;
  };
  labDetails?: {
    laboratoryName: string;
    laboratoryType: string;
    accreditationNumber?: string;
    organization: string;
    address: string;
  };
  officialDetails?: {
    department: string;
    designation: string;
    employeeId: string;
    officeAddress?: string;
    directorate?: string;
  };

  isPhoneVerified: boolean;
  isEmailVerified?: boolean;
  documents?: {
    type: 'GOV_ID' | 'VET_LICENSE' | 'LAB_ACCREDITATION' | 'OFFICE_ID' | 'APPOINTMENT_LETTER' | 'CERTIFICATE';
    name: string;
    size: number;
    mimeType: string;
    previewUrl?: string;
  }[];
}

class RegistrationService {
  private requests: RegistrationRequest[] = [];
  private auditLogs: RegistrationAuditLog[] = [];
  private simulatedOtps: Record<string, { code: string; expiresAt: number }> = {};
  private listeners: (() => void)[] = [];

  constructor() {
    this.requests = loadStorage<RegistrationRequest[]>(REG_STORAGE_KEYS.REQUESTS, SEED_REGISTRATIONS);
    this.auditLogs = loadStorage<RegistrationAuditLog[]>(REG_STORAGE_KEYS.AUDIT, []);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('Registration listener error', e);
      }
    });
  }

  // ==========================================
  // OTP SIMULATION & VERIFICATION
  // ==========================================

  public sendMobileOtp(phone: string): { success: boolean; simulatedCode: string; message: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, simulatedCode: '', message: 'Please enter a valid 10-digit mobile number.' };
    }

    // Generate secure 6-digit OTP (for easy testing, we also return the code)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.simulatedOtps[cleanPhone] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    return {
      success: true,
      simulatedCode: code,
      message: `OTP sent successfully to ${phone}. Valid for 5 minutes.`
    };
  }

  public verifyMobileOtp(phone: string, inputOtp: string): { success: boolean; message: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanOtp = inputOtp.trim();

    // Support universal demo OTP '123456' or generated code
    if (cleanOtp === '123456') {
      return { success: true, message: 'Mobile number verified successfully.' };
    }

    const record = this.simulatedOtps[cleanPhone];
    if (!record) {
      // Fallback verification for demo
      if (cleanOtp.length === 6) {
        return { success: true, message: 'Mobile number verified successfully.' };
      }
      return { success: false, message: 'No active OTP found. Please click Send OTP.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new code.' };
    }

    if (record.code !== cleanOtp) {
      return { success: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    delete this.simulatedOtps[cleanPhone];
    return { success: true, message: 'Mobile number verified successfully.' };
  }

  // ==========================================
  // REGISTRATION CREATION & SUBMISSION
  // ==========================================

  public registerUser(input: RegisterUserInput): {
    success: boolean;
    requestId?: string;
    request?: RegistrationRequest;
    user?: User;
    status: AccountStatus;
    error?: string;
  } {
    // 1. Mandatory Mobile OTP Validation
    if (!input.isPhoneVerified) {
      return {
        success: false,
        status: 'REJECTED',
        error: 'Mobile phone verification is mandatory before registration.'
      };
    }

    // 2. Strict Security: Reject any attempt to self-register as SYSTEM_ADMIN
    if (input.role === 'SYSTEM_ADMIN') {
      return {
        success: false,
        status: 'REJECTED',
        error: 'System Administrator accounts cannot be self-registered. Contact National Biosecurity IT Directorate.'
      };
    }

    // 3. Prevent duplicate account
    const existingUsers = store.getAllUsers();
    const cleanPhone = input.phone.replace(/\D/g, '');
    const isDup = existingUsers.some(u => {
      const uPhone = u.phone.replace(/\D/g, '');
      return uPhone === cleanPhone || (input.email && u.email.toLowerCase() === input.email.toLowerCase());
    });

    if (isDup) {
      return {
        success: false,
        status: 'REJECTED',
        error: 'An account with this mobile number or email already exists. Please sign in.'
      };
    }

    // 4. Generate unique IDs
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = `LG-REG-${randomSuffix}`;
    const userId = `usr_reg_${input.role.toLowerCase()}_${Date.now()}`;

    // 5. Build Verification Documents list
    const docs: VerificationDocument[] = (input.documents || []).map((d, index) => ({
      id: `doc_${randomSuffix}_${index}`,
      userId,
      requestId,
      documentType: d.type,
      documentName: d.name,
      fileName: d.name,
      fileSize: d.size,
      mimeType: d.mimeType,
      secureStorageReference: `sec_vault://credentials/${requestId}/${d.name}`,
      verificationStatus: 'PENDING',
      uploadedAt: new Date().toISOString(),
      retentionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      previewUrl: d.previewUrl
    }));

    // 6. Determine Account Status
    // Per specification:
    // Farmer with verified mobile OTP is immediately VERIFIED.
    // Privileged roles (Field Worker, Vet, Diagnostic Lab, District Official, State Admin) MUST remain PENDING_VERIFICATION until authorized review.
    const isPrivileged = input.role !== 'FARMER';
    const initialStatus: AccountStatus = isPrivileged ? 'PENDING_VERIFICATION' : 'VERIFIED';

    const getRoleLabel = (role: Role): string => {
      switch (role) {
        case 'FARMER': return 'Farmer / Livestock Owner';
        case 'FIELD_WORKER': return 'Field Worker / Para-Vet';
        case 'VETERINARIAN': return 'Veterinarian (BVSc & AH)';
        case 'LABORATORY_STAFF':
        case 'DIAGNOSTIC_LAB': return 'Diagnostic Laboratory';
        case 'DISTRICT_OFFICIAL': return 'District Animal Health Official';
        case 'STATE_ADMIN': return 'State Admin / Directorate';
        default: return role;
      }
    };

    const newRequest: RegistrationRequest = {
      id: requestId,
      userId,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ? input.email.trim() : `${cleanPhone}@farmer.livestockguard.in`,
      requestedRole: input.role,
      accountTypeLabel: getRoleLabel(input.role),
      status: initialStatus,
      stateId: input.stateId || 'st_mah',
      stateName: input.stateName || 'Maharashtra',
      districtId: input.districtId || 'dt_pune',
      districtName: input.districtName || 'Pune',
      blockName: input.blockName || 'Baramati',
      villageName: input.villageName || 'Malegaon',
      preferredLanguage: input.preferredLanguage || 'en',
      farmDetails: input.farmDetails,
      fieldWorkerDetails: input.fieldWorkerDetails,
      vetDetails: input.vetDetails,
      labDetails: input.labDetails,
      officialDetails: input.officialDetails,
      isPhoneVerified: true,
      isEmailVerified: !!input.isEmailVerified,
      documents: docs,
      submittedAt: new Date().toISOString()
    };

    // 7. Create User Account in store
    const newUser: User = {
      id: userId,
      name: input.fullName.trim(),
      email: newRequest.email,
      phone: input.phone.trim(),
      role: input.role,
      requestedRole: input.role,
      accountStatus: initialStatus,
      registrationRequestId: requestId,
      stateId: newRequest.stateId,
      districtId: newRequest.districtId,
      blockId: input.blockName,
      village: input.villageName,
      licenseNumber: input.vetDetails?.regNumber || input.labDetails?.accreditationNumber || input.officialDetails?.employeeId,
      preferredLanguage: input.preferredLanguage || 'en',
      isPhoneVerified: true,
      isEmailVerified: !!input.isEmailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save request
    this.requests = [newRequest, ...this.requests];
    saveStorage(REG_STORAGE_KEYS.REQUESTS, this.requests);

    // Save to user store
    store.addUser(newUser);

    // Audit Log
    this.recordAudit({
      userId,
      action: 'REGISTRATION_SUBMITTED',
      targetType: 'REGISTRATION_REQUEST',
      targetId: requestId,
      actorName: input.fullName,
      actorRole: input.role,
      metadata: {
        role: input.role,
        status: initialStatus,
        docCount: docs.length
      }
    });

    // Notify reactive UI listeners
    this.notify();

    return {
      success: true,
      requestId,
      request: newRequest,
      user: newUser,
      status: initialStatus
    };
  }

  // ==========================================
  // QUERY & TRACKING
  // ==========================================

  public getAllRequests(): RegistrationRequest[] {
    return this.requests;
  }

  public getRequestById(id: string): RegistrationRequest | undefined {
    return this.requests.find(r => r.id.toLowerCase() === id.trim().toLowerCase());
  }

  public trackRegistration(query: string): RegistrationRequest | undefined {
    if (!query || !query.trim()) return undefined;
    const q = query.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');

    return this.requests.find(r => {
      if (r.id.toLowerCase() === q) return true;
      if (r.email.toLowerCase() === q) return true;
      if (cleanDigits && cleanDigits.length >= 8 && r.phone.replace(/\D/g, '').includes(cleanDigits)) return true;
      return false;
    });
  }

  // ==========================================
  // ADMIN APPROVAL WORKFLOW
  // ==========================================

  public reviewRegistration(
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW' | 'REQUEST_INFO',
    notes?: string,
    reviewerName: string = 'System Biosecurity Directorate'
  ): { success: boolean; request?: RegistrationRequest; newStatus?: AccountStatus; error?: string } {
    const reqIndex = this.requests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) {
      return { success: false, error: 'Registration request not found.' };
    }

    const req = this.requests[reqIndex];
    let newStatus: AccountStatus = req.status;

    switch (action) {
      case 'APPROVE':
        newStatus = 'VERIFIED';
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'UNDER_REVIEW':
        newStatus = 'UNDER_REVIEW';
        break;
      case 'REQUEST_INFO':
        newStatus = 'MORE_INFORMATION_REQUIRED';
        break;
    }

    const updatedReq: RegistrationRequest = {
      ...req,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      reviewerName,
      reviewNotes: notes || (action === 'APPROVE' ? 'Official credentials and regulatory authority verified.' : '')
    };

    this.requests[reqIndex] = updatedReq;
    saveStorage(REG_STORAGE_KEYS.REQUESTS, this.requests);

    // Update user in store
    const allUsers = store.getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === req.userId || u.phone === req.phone || u.email === req.email);

    if (userIndex !== -1) {
      const user = allUsers[userIndex];
      const updatedUser: User = {
        ...user,
        accountStatus: newStatus,
        role: newStatus === 'VERIFIED' ? req.requestedRole : user.role,
        statusReason: notes,
        updatedAt: new Date().toISOString()
      };
      store.updateUser(updatedUser);
    }

    // Audit Log
    this.recordAudit({
      userId: req.userId,
      action: action === 'APPROVE' ? 'ROLE_APPROVED' : action === 'REJECT' ? 'ROLE_REJECTED' : 'STATUS_CHANGED',
      targetType: 'REGISTRATION_REQUEST',
      targetId: requestId,
      actorName: reviewerName,
      actorRole: 'STATE_ADMIN',
      metadata: { action, notes, previousStatus: req.status, newStatus }
    });

    // Notify reactive UI listeners
    this.notify();

    return { success: true, request: updatedReq, newStatus };
  }

  // ==========================================
  // AUDIT LOGGING
  // ==========================================

  private recordAudit(entry: Omit<RegistrationAuditLog, 'id' | 'timestamp'>) {
    const log: RegistrationAuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs = [log, ...this.auditLogs];
    saveStorage(REG_STORAGE_KEYS.AUDIT, this.auditLogs);
  }

  public getAuditLogs(): RegistrationAuditLog[] {
    return this.auditLogs;
  }
}

export const registrationService = new RegistrationService();
