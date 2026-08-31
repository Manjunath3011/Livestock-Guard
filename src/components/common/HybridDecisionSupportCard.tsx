import React from 'react';
import { HybridRiskAssessment, Role } from '../../types';
import { RiskBadge } from './RiskBadge';
import {
  ShieldAlert,
  BrainCircuit,
  Stethoscope,
  Syringe,
  HeartHandshake,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Compass
} from 'lucide-react';
import { getTerminology } from '../../utils/terminology';
import { store } from '../../services/store';
import { useTranslation } from '../../i18n/translations';

interface HybridDecisionSupportCardProps {
  assessment: HybridRiskAssessment;
  showActions?: boolean;
  onReferToVet?: () => void;
  onRequestLabTest?: () => void;
  role?: Role | string;
}

export const HybridDecisionSupportCard: React.FC<HybridDecisionSupportCardProps> = ({
  assessment,
  showActions = true,
  onReferToVet,
  onRequestLabTest,
  role
}) => {
  const { t, currentLang } = useTranslation();
  const activeRole = role || store.getCurrentUser()?.role || 'FARMER';
  const terms = getTerminology(activeRole, currentLang);
  const isFarmer = activeRole === 'FARMER';

  const {
    finalRiskLevel,
    finalRiskScore,
    primarySuspectedDisease,
    rankedSuspectedDiseases,
    mlScreening,
    ruleEvidence,
    explainableFactors,
    decisionSupport
  } = assessment;

  const mlProbabilityPct = Math.round(primarySuspectedDisease.mlProbability * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6">
      {/* 1. Header Banner */}
      <div className={`p-6 sm:p-7 border-b ${
        finalRiskLevel === 'CRITICAL'
          ? 'bg-rose-900 text-white border-rose-950'
          : finalRiskLevel === 'HIGH'
          ? 'bg-amber-900 text-white border-amber-950'
          : finalRiskLevel === 'MODERATE'
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-emerald-900 text-white border-emerald-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
              <BrainCircuit className="w-4 h-4" />
              {isFarmer
                ? `🤖 ${terms.possibleDisease} (${terms.aiCheck})`
                : '🤖 ML Disease Screening & Decision Support (Prototype)'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {primarySuspectedDisease.diseaseName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-white/15 px-2.5 py-1 rounded-full font-bold backdrop-blur-xs flex items-center gap-1.5" title="Model-estimated screening likelihood from tabular classifier">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-300" />
                {isFarmer ? `${terms.aiCheck}: ` : 'Model-Estimated Likelihood: '}<strong>{mlProbabilityPct}%</strong>
              </span>
              {!isFarmer && (
                <span className="bg-white/15 px-2.5 py-1 rounded-full font-bold backdrop-blur-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  Rule Evidence: <strong>{ruleEvidence.ruleRiskLevel}</strong>
                </span>
              )}
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                {mlScreening.modelVersion}
              </span>
              {primarySuspectedDisease.notifiable && (
                <span className="bg-rose-500/80 text-white px-2.5 py-1 rounded-full font-bold text-[11px]">
                  {isFarmer ? 'High Priority Alert' : 'State Notifiable'}
                </span>
              )}
              {primarySuspectedDisease.zoonotic && (
                <span className="bg-amber-500/80 text-white px-2.5 py-1 rounded-full font-bold text-[11px]">
                  {isFarmer ? 'Can Spread to Humans' : 'Zoonotic Precaution'}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <RiskBadge level={finalRiskLevel} score={finalRiskScore} role={activeRole} size="lg" />
            <span className="text-[11px] font-bold text-slate-300 block mt-1">
              {isFarmer ? 'Danger Level Score: ' : 'Overall Composite Score: '}{finalRiskScore} / 100
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* 2. Explainable AI: Why the System Flagged This */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-600" />
              {isFarmer ? 'WHY THIS DISEASE IS SUSPECTED (KEY SIGNS)' : 'EXPLAINABLE AI: WHY THE SYSTEM FLAGGED THIS'}
            </h3>
            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              Model: {mlScreening.modelVersion}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {explainableFactors.map((factor, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  factor.severity === 'CRITICAL'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : factor.severity === 'ALERT'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                  factor.severity === 'CRITICAL' ? 'text-rose-600' : 'text-emerald-600'
                }`} />
                <div className="text-xs">
                  <span className="font-black block">{factor.title}</span>
                  <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Differential Probability Table */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-2">
              {isFarmer ? 'Other Possible Conditions Checked:' : 'Differential Screening Ranking (Top Models):'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rankedSuspectedDiseases.map((dis, idx) => (
                <div key={dis.diseaseId} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>#{idx + 1}</span>
                    <span className="text-emerald-700 font-mono font-black">
                      {Math.round(dis.mlProbability * 100)}% {isFarmer ? 'match' : 'ML'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 truncate mt-1">{dis.diseaseName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Decision Support Modules: 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module A: Vaccination Advice */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Syringe className="w-4 h-4 text-emerald-600" />
                {isFarmer ? 'HOW TO PREVENT IT (VACCINES)' : 'VACCINATION GUIDANCE'}
              </div>
              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p><strong>{isFarmer ? 'Regular Prevention: ' : 'Routine Prevention:'}</strong> {decisionSupport.vaccinationGuidance.routineRecommendation}</p>
                {decisionSupport.vaccinationGuidance.outbreakResponseRecommendation && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] font-semibold">
                    ⚡ {decisionSupport.vaccinationGuidance.outbreakResponseRecommendation}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[10px] font-bold text-rose-900 leading-tight">
              ⚠ {decisionSupport.vaccinationGuidance.contraindicationWarning}
            </div>
          </div>

          {/* Module B: Safe Supportive & Home Care */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                {isFarmer ? 'SAFE HOME & SHED CARE' : 'SAFE SUPPORTIVE CARE'}
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                {decisionSupport.supportiveCare.immediateSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="font-bold text-emerald-700 shrink-0">{idx + 1}.</span>
                    <span><strong>{step.title}:</strong> {step.instruction || step.desc || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 italic">
              {decisionSupport.supportiveCare.medicalNotice}
            </div>
          </div>

          {/* Module C: Veterinary Referral & Lab Pathway */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                {isFarmer ? 'DOCTOR VISIT & LAB TEST' : 'VET & LAB CONFIRMATION'}
              </div>
              <div className="text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 text-[11px]">{isFarmer ? 'Urgency Level:' : 'Urgency:'}</span>
                  <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-rose-100 text-rose-900">
                    {decisionSupport.veterinaryReferral.urgency}
                  </span>
                </div>
                <p className="text-[11px]">{decisionSupport.veterinaryReferral.actionSummary}</p>
                <div className="pt-1 border-t border-slate-200/80 text-[11px]">
                  <span className="font-bold text-slate-700 block mb-0.5">{isFarmer ? 'Required Doctor / Lab Test:' : 'Required Lab Test:'}</span>
                  <div className="flex items-center gap-1.5 font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                    <FlaskConical className="w-3.5 h-3.5" />
                    {decisionSupport.laboratoryPathway.recommendedTest} ({decisionSupport.laboratoryPathway.sampleTypeRequired})
                  </div>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                {onReferToVet && (
                  <button
                    type="button"
                    onClick={onReferToVet}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {isFarmer ? t('callDoctor', 'Call Doctor / Para-Vet') : t('veterinaryReferral', 'Dispatch to Vet')}
                  </button>
                )}
                {onRequestLabTest && (
                  <button
                    type="button"
                    onClick={onRequestLabTest}
                    className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t('laboratoryTest', 'Request Lab Test')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Biosecurity Directives & Legal Disclaimer */}
        <div className="bg-amber-50/70 border border-amber-300/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-amber-950 font-bold">
              {isFarmer ? '⚠️ Important Medical Notice for Farmers' : 'Surveillance & Early Detection Notice'}
            </strong>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {isFarmer
                ? 'AI predictions and compatibility rankings are for early screening guidance only. A licensed veterinarian must perform an on-farm examination and confirm the diagnosis before treatment.'
                : `${assessment.legalDisclaimer} ${mlScreening.screeningDisclaimer}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

