import React from 'react';
import { TreatmentRecord } from '../../types';
import { Pill, ShieldAlert, CheckCircle, Clock, AlertTriangle, Stethoscope } from 'lucide-react';

interface TreatmentsViewProps {
  treatments: TreatmentRecord[];
}

export const TreatmentsView: React.FC<TreatmentsViewProps> = ({ treatments = [] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <Pill className="w-4 h-4" />
          Veterinary Therapeutics & Drug Stewardship
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Treatment & Prescription Records ({treatments.length} Prescriptions)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Track antibiotic administration, supportive care regimens, and recovery follow-ups.
        </p>
      </div>

      {treatments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
          <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
          No treatment records found. Prescribe treatments from the Veterinary Clinical Triage board.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {treatments.map(trt => (
            <div
              key={trt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    {trt.caseId ? `Case #${trt.caseId}` : 'Routine Prescription'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{trt.suspectedDisease || 'Supportive Care Protocol'}</h3>
                  <p className="text-xs text-slate-500">
                    Prescribed by: {trt.veterinarianName || 'Attending Field Veterinarian'}
                  </p>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  trt.treatmentResponse === 'RECOVERED' || trt.treatmentResponse === 'IMPROVING'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {trt.treatmentResponse || 'ACTIVE'}
                </span>
              </div>

              {/* Medications List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Prescribed Drug Regimen:
                </h4>
                {(trt.medicines || []).map((med, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{med.medicineName}</span>
                      <span className="text-emerald-700 font-medium">{med.dosage}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Route: {med.route}</span>
                      <span>•</span>
                      <span>Duration: {med.durationDays} Days</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Husbandry & Remarks */}
              {trt.remarks && (
                <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block mb-0.5">Clinical Instructions & Husbandry:</span>
                  <p>{trt.remarks}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Animal Tag: {trt.animalTag || 'Herd Group'}</span>
                <span>Date: {trt.treatmentDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
