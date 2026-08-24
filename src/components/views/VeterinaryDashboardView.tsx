import React, { useState } from 'react';
import { Case, User, CaseStatus, LabSample } from '../../types';
import { store } from '../../services/store';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import { Modal } from '../common/Modal';
import {
  Stethoscope,
  Activity,
  Filter,
  CheckCircle,
  FlaskConical,
  Pill,
  ShieldAlert,
  Clock,
  MapPin,
  ChevronRight,
  FileText,
  AlertOctagon,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VeterinaryDashboardViewProps {
  cases: Case[];
  currentUser: User;
  onSelectCase?: (caseId: string) => void;
}

export const VeterinaryDashboardView: React.FC<VeterinaryDashboardViewProps> = ({
  cases,
  currentUser
}) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modals
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState<CaseStatus>('VET_VISIT_REQUIRED');
  const [statusNotes, setStatusNotes] = useState('');

  // Sample Order State
  const [sampleType, setSampleType] = useState<LabSample['sampleType']>('VESICULAR_FLUID');
  const [testRequested, setTestRequested] = useState<LabSample['testRequested']>('RT_PCR');
  const [labName, setLabName] = useState('Pune District Disease Investigation Lab (DIAL)');

  // Treatment State
  const [medicineName, setMedicineName] = useState('Enrofloxacin 10% + Meloxicam');
  const [dosage, setDosage] = useState('15 ml IM OD for 3 days');
  const [treatmentNotes, setTreatmentNotes] = useState('Provide soft mash feed and 2% sodium carbonate mouth wash.');

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
    return true;
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.updateCaseStatus(selectedCase.id, newStatus, statusNotes);
    setIsStatusModalOpen(false);
    setStatusNotes('');

    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleOrderSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.createLabSample({
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      animalId: selectedCase.animalId,
      animalTag: selectedCase.animalTag,
      species: selectedCase.species,
      sampleType,
      collectionDate: new Date().toISOString().split('T')[0],
      collectedBy: currentUser.name,
      laboratoryId: 'lab_pune_dial',
      laboratoryName: labName,
      testRequested,
      suspectedDiseaseName: selectedCase.suspectedDiseases[0]?.diseaseName || 'Foot-and-Mouth Disease',
      remarks: 'Urgent sample collected during field clinical triage.'
    });

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}

    setIsSampleModalOpen(false);
    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handlePrescribeTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.createTreatmentRecord({
      caseId: selectedCase.id,
      animalId: selectedCase.animalId,
      animalTag: selectedCase.animalTag,
      species: selectedCase.species,
      farmName: selectedCase.farmName,
      suspectedDisease: selectedCase.suspectedDiseases[0]?.diseaseName || 'Clinical Syndrome',
      treatmentDate: new Date().toISOString().split('T')[0],
      medicines: [
        {
          medicineName,
          dosage,
          durationDays: 3,
          route: 'INTRAMUSCULAR'
        }
      ],
      veterinarianId: currentUser.id,
      veterinarianName: currentUser.name,
      treatmentResponse: 'IMPROVING',
      remarks: treatmentNotes
    });

    setIsTreatmentModalOpen(false);
    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            Veterinary Clinical Triage & Differential Hub
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Clinical Surveillance Board ({filteredCases.length} Cases)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review live field reports, order lab testing, prescribe supportive care, and issue quarantine containment orders.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Reports</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VET_VISIT_REQUIRED">Vet Visit Required</option>
            <option value="LAB_TESTING">In Lab Testing</option>
            <option value="CONFIRMED">Confirmed Positive</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Main Split View: Cases Table + Interactive Detailed Inspection Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List Table (6 or 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
            <span>Surveillance Triage Queue</span>
            <span>{filteredCases.length} Active Records</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredCases.map(c => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {c.caseNumber}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {c.species} • {c.villageName}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mt-1">
                        Suspected: {c.suspectedDiseases[0]?.diseaseName || 'Under Evaluation'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <RiskBadge level={c.riskLevel} score={c.riskScore} size="sm" />
                      <CaseStatusBadge status={c.status} size="sm" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 bg-slate-50/80 p-1.5 rounded">
                    Symptoms: {(c.symptoms || []).map(s => s.symptomName).join(', ')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Reported by: {c.reporterName} ({c.reporterRole})</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Inspection & Clinical Action Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedCase ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5 sticky top-20">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Case Details
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedCase.caseNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCase.villageName}, {selectedCase.districtName}
                  </p>
                </div>
                <RiskBadge level={selectedCase.riskLevel} score={selectedCase.riskScore} />
              </div>

              {/* Triage & Clinical Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setNewStatus(selectedCase.status);
                    setIsStatusModalOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
                >
                  Update Status
                </button>

                <button
                  onClick={() => setIsSampleModalOpen(true)}
                  className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Order Lab
                </button>

                <button
                  onClick={() => setIsTreatmentModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Pill className="w-3.5 h-3.5" />
                  Prescribe
                </button>
              </div>

              {/* Clinical Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <CaseStatusBadge status={selectedCase.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Morbidity / Dead:</span>
                  <span className="font-bold text-slate-800">
                    {selectedCase.affectedCount} Sick / {selectedCase.deadCount} Dead
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner Contact:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.ownerName} ({selectedCase.ownerPhone})</span>
                </div>
              </div>

              {/* Differential Ranking */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Top Differential Matches:
                </h4>
                {(selectedCase.suspectedDiseases || []).map((d, i) => (
                  <div key={d.diseaseId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-900">{i + 1}. {d.diseaseName}</span>
                    <span className="font-mono text-emerald-700 font-bold">{d.screeningScore}%</span>
                  </div>
                ))}
              </div>

              {/* Audit Trail */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Audit Trail ({(selectedCase.auditTrail || []).length} Logs)
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {(selectedCase.auditTrail || []).map(log => (
                    <div key={log.id} className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{log.actorName} ({log.actorRole})</span>
                        <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              Select a case from the queue on the left to inspect differential diagnoses, order lab tests, or update status.
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedCase && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Clinical Status: ${selectedCase.caseNumber}`}
          subtitle="Transition case workflow status and record official veterinary clinical notes."
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Status *</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW - Clinical Evaluation</option>
                <option value="VET_VISIT_REQUIRED">VET_VISIT_REQUIRED - Field Triage Needed</option>
                <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED - Diagnostic Sample Taken</option>
                <option value="LAB_TESTING">LAB_TESTING - Forwarded to DIAL Lab</option>
                <option value="CONFIRMED">CONFIRMED - Positive Laboratory/Clinical Diagnosis</option>
                <option value="RULED_OUT">RULED_OUT - Negative / Non-Infectious</option>
                <option value="CONTAINMENT">CONTAINMENT - Outbreak Ring Quarantine Active</option>
                <option value="RESOLVED">RESOLVED - Animal Fully Recovered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Findings & Actions *</label>
              <textarea
                required
                rows={3}
                placeholder="Enter physical exam findings, temperature, lesions observed..."
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save Status Transition
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lab Sample Order Modal */}
      {selectedCase && (
        <Modal
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          title={`Order Diagnostic Lab Sample`}
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species}`}
          maxWidth="lg"
        >
          <form onSubmit={handleOrderSample} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sample Specimen Type *</label>
                <select
                  value={sampleType}
                  onChange={e => setSampleType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="VESICULAR_FLUID">Vesicular Fluid / Epithelium</option>
                  <option value="NASAL_SWAB">Nasal / Pharyngeal Swab</option>
                  <option value="BLOOD_SERUM">Blood Serum Tube</option>
                  <option value="MILK_SAMPLE">Aseptic Milk Sample</option>
                  <option value="SKIN_SCRAPING">Skin Scab / Biopsy</option>
                  <option value="FECAL_SAMPLE">Fecal Sample</option>
                  <option value="TISSUE_BIOPSY">Tissue Biopsy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Test Requested *</label>
                <select
                  value={testRequested}
                  onChange={e => setTestRequested(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="RT_PCR">Molecular Real-Time RT-PCR</option>
                  <option value="ELISA">ELISA Antibody / Antigen Assay</option>
                  <option value="BACTERIAL_CULTURE">Bacterial Culture & AST</option>
                  <option value="BLOOD_SMEAR_MICROSCOPY">Blood Smear Microscopy (Giemsa)</option>
                  <option value="ANTIGEN_RAPID">Rapid Antigen Lateral Flow Strip</option>
                  <option value="SEROLOGY">Serological Agglutination</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designated Laboratory Destination *</label>
              <select
                value={labName}
                onChange={e => setLabName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Pune District Disease Investigation Lab (DIAL)">Pune District Disease Investigation Lab (DIAL)</option>
                <option value="Anand Veterinary College Diagnostic Core Lab">Anand Veterinary College Diagnostic Core Lab</option>
                <option value="National Institute of Veterinary Epidemiology (NIVEDI)">National Institute of Veterinary Epidemiology (NIVEDI)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Dispatch Sample to Lab
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription Modal */}
      {selectedCase && (
        <Modal
          isOpen={isTreatmentModalOpen}
          onClose={() => setIsTreatmentModalOpen(false)}
          title="Prescribe Veterinary Treatment & Supportive Care"
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species}`}
          maxWidth="lg"
        >
          <form onSubmit={handlePrescribeTreatment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={e => setMedicineName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage & Frequency *</label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supportive Care & Husbandry Instructions</label>
              <textarea
                rows={2}
                value={treatmentNotes}
                onChange={e => setTreatmentNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTreatmentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Issue Prescription
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
