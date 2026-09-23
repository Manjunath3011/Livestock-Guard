import React, { useEffect } from 'react';
import { LabSample } from '../../types';
import { store } from '../../services/store';
import {
  FlaskConical,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building,
  ShieldCheck,
  Download
} from 'lucide-react';

interface LabCertificateModalProps {
  sample: LabSample | null;
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

export const LabCertificateModal: React.FC<LabCertificateModalProps> = ({
  sample,
  isOpen,
  onClose,
  isDemoMode = false
}) => {
  useEffect(() => {
    if (isOpen && sample) {
      // Audit log the generation of this official test certificate
      store.logLabAction({
        action: 'LAB_REPORT_GENERATED',
        sampleId: sample.id,
        sampleCode: sample.sampleCode,
        caseId: sample.caseId,
        caseNumber: sample.caseNumber,
        newValue: sample.result,
        details: `Generated official diagnostic pathology certificate for sample ${sample.sampleCode} (${sample.testRequested}: ${sample.result})`
      });
    }
  }, [isOpen, sample]);

  if (!isOpen || !sample) return null;

  const isPositive = sample.result === 'POSITIVE';
  const isNegative = sample.result === 'NEGATIVE';
  const certNumber = `CERT-VDL-${sample.sampleCode.replace(/[^A-Z0-9]/gi, '')}-${sample.resultDate || '2026'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Certificate Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
                Department of Animal Husbandry & Dairying
              </div>
              <h3 className="text-lg font-black tracking-tight">
                Official Veterinary Diagnostic Certificate
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 mt-3 gap-2">
            <span>Certificate Ref: <strong className="text-slate-200 font-mono">{certNumber}</strong></span>
            <span>Accreditation: <strong className="text-slate-200">ISO/IEC 17025 Certified</strong></span>
          </div>

          {isDemoMode && (
            <div className="mt-3 inline-block bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30">
              DEMO DATA — Simulated Laboratory Test Certificate
            </div>
          )}
        </div>

        {/* Certificate Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Facility Details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {sample.laboratoryName || 'Regional Veterinary Disease Diagnostic Laboratory'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                State Disease Investigation Section • Strict Biosecurity Containment Level 2+
              </div>
            </div>
          </div>

          {/* Sample Identification Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Sample Barcode</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{sample.sampleCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Surveillance Case ID</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{sample.caseNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Host Species</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.species}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Animal Identification</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.animalTag || 'Individual ID on file'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Biological Specimen</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.sampleType.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Collection Date</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.collectionDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Investigating Officer</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.collectedBy}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Laboratory Result Date</span>
              <span className="font-bold text-slate-900 dark:text-white">{sample.resultDate || 'Certified Today'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnostic Modality</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{sample.testRequested.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Diagnostic Result Highlight Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
              isPositive
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                : isNegative
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider">
                Target Disease Assayed: {sample.suspectedDiseaseName}
              </div>
              <div className="text-xl font-black mt-0.5 flex items-center gap-2">
                {isPositive ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>DIAGNOSTIC OUTCOME: POSITIVE</span>
                  </>
                ) : isNegative ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>DIAGNOSTIC OUTCOME: NEGATIVE (RULED OUT)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>DIAGNOSTIC OUTCOME: {sample.result}</span>
                  </>
                )}
              </div>
              <div className="text-xs mt-1 opacity-90">
                {sample.resultDetails || 'Assay completed adhering strictly to national veterinary reference protocol.'}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/70 dark:bg-slate-900/60 rounded-full font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>QA Verified</span>
              </span>
            </div>
          </div>

          {/* Pathology Notes & Sign-off */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pathologist Examination Notes</span>
            <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs italic text-slate-600 dark:text-slate-300">
              {sample.remarks || 'Standard diagnostic controls validated. Internal positive control showed anticipated cycle threshold / optical density response.'}
            </p>
          </div>

          {/* Attestation & Signatures */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Tested & Certified By</div>
              <div className="font-bold text-slate-900 dark:text-white">{sample.testedBy || 'Dr. Priya Kulkarni, MVSc (Pathology)'}</div>
              <div className="text-[10px] text-slate-500">Authorized Veterinary Pathologist</div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Diagnostic Laboratory Directorate</div>
              <div className="font-bold text-slate-900 dark:text-white">Central Biosecurity Registry</div>
              <div className="text-[10px] text-slate-500">Government of Maharashtra & India</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Audit ID: <span className="font-mono">{sample.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
