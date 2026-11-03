import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
  Stethoscope,
  FlaskConical,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { Species, Role, User } from '../../types';
import {
  ImageScreeningRecord,
  ImageValidationReport,
  ImageScreeningStatus,
  VisualFeasibilityTier,
  LIVESTOCK_11_DISEASE_TAXONOMY
} from '../../types/imageScreening';
import { imageIntelligenceService } from '../../services/ImageIntelligenceService';
import { photoStorageService } from '../../services/PhotoStorageService';
import { CameraCapture, CapturedPhotoPayload } from './CameraCapture';

interface LivestockImageScreeningCardProps {
  species: Species;
  onSpeciesChange?: (species: Species) => void;
  animalId?: string;
  caseId?: string;
  currentUser?: User;
  onScreeningComplete?: (screening: ImageScreeningRecord) => void;
  targetSuspectedDiseaseId?: string;
  initialScreening?: ImageScreeningRecord;
  readOnly?: boolean;
}

export const LivestockImageScreeningCard: React.FC<LivestockImageScreeningCardProps> = ({
  species,
  onSpeciesChange,
  animalId,
  caseId,
  currentUser,
  onScreeningComplete,
  targetSuspectedDiseaseId,
  initialScreening,
  readOnly = false
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(initialScreening?.imageStoragePath || null);
  const [validationReport, setValidationReport] = useState<ImageValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<ImageScreeningRecord | null>(initialScreening || null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [showTaxonomyModal, setShowTaxonomyModal] = useState<boolean>(false);
  const [vetNotesInput, setVetNotesInput] = useState<string>('');
  const [isSubmittingVetReview, setIsSubmittingVetReview] = useState<boolean>(false);

  const role = currentUser?.role || 'FARMER';
  const isVet = role === 'VETERINARIAN';
  const isFieldWorker = role === 'FIELD_WORKER';
  const canReview = isVet && screeningResult !== null;

  // Active Model Info
  const activeModel = imageIntelligenceService.getActiveModel();

  // Disease taxonomy for current species
  const compatibleTaxonomy = LIVESTOCK_11_DISEASE_TAXONOMY.filter(d =>
    d.targetSpecies.includes(species)
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidating(true);
    setScreeningResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoDataUrl(dataUrl);

      // Run validation
      const report = await imageIntelligenceService.validateImage(file, dataUrl);
      setValidationReport(report);
      setIsValidating(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async (payload: CapturedPhotoPayload) => {
    setIsCameraOpen(false);
    setPhotoDataUrl(payload.dataUrl);
    setIsValidating(true);
    setScreeningResult(null);

    const blob = new Blob([payload.dataUrl], { type: 'image/jpeg' });
    const report = await imageIntelligenceService.validateImage(blob, payload.dataUrl);
    setValidationReport(report);
    setIsValidating(false);
  };

  const handleRunScreening = async () => {
    if (!photoDataUrl) return;

    setIsScreening(true);
    try {
      const result = await imageIntelligenceService.screenLivestockPhoto({
        photoDataUrl,
        species,
        caseId,
        animalId,
        targetSuspectedDiseaseId
      });

      setScreeningResult(result);
      if (onScreeningComplete) {
        onScreeningComplete(result);
      }
    } finally {
      setIsScreening(false);
    }
  };

  const handleSaveVetReview = (reviewStatus: ImageScreeningRecord['veterinarianReviewStatus']) => {
    if (!screeningResult) return;
    setIsSubmittingVetReview(true);

    const updated = imageIntelligenceService.updateVeterinarianReview(
      screeningResult.id,
      reviewStatus,
      vetNotesInput,
      currentUser?.name || 'Registered Veterinarian'
    );

    if (updated) {
      setScreeningResult({ ...updated });
      if (onScreeningComplete) {
        onScreeningComplete(updated);
      }
    }
    setIsSubmittingVetReview(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-5 sm:p-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Livestock Image Intelligence Engine
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {activeModel.architecture}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Preliminary computer-vision screening for animal lesions and visual symptoms.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTaxonomyModal(true)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          11-Disease Visual Feasibility Guide
        </button>
      </div>

      {/* 2. Animal Species Selector / Confirmation */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-0.5">
            Confirmed Animal Species
          </label>
          <p className="text-[11px] text-slate-500">
            Ensures model uses species-appropriate anatomical and lesion parameters.
          </p>
        </div>

        <select
          value={species}
          disabled={readOnly || !onSpeciesChange}
          onChange={e => onSpeciesChange && onSpeciesChange(e.target.value as Species)}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
        >
          <option value="Cattle">Cattle (Cow / Bullock)</option>
          <option value="Buffalo">Water Buffalo</option>
          <option value="Goat">Goat</option>
          <option value="Sheep">Sheep</option>
          <option value="Pig">Pig / Swine</option>
          <option value="Poultry">Poultry (Chicken / Duck)</option>
          <option value="Horse">Equine / Horse</option>
        </select>
      </div>

      {/* 3. Photo Upload / Camera Area */}
      {!readOnly && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Upload Photograph</span>
                <span className="text-[10px] text-slate-400">JPEG, PNG up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Capture with Camera</span>
                <span className="text-[10px] text-slate-400">Live inspection on-farm</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 4. Preview & Validation Feedback */}
      {photoDataUrl && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative group shrink-0">
              <img
                src={photoDataUrl}
                alt="Uploaded livestock preview"
                className="w-36 h-36 object-cover rounded-xl border border-slate-300 bg-black"
              />
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono">
                {validationReport?.width ? `${validationReport.width}x${validationReport.height}` : 'Preview'}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Technical Image Validation
                </span>
                {isValidating ? (
                  <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking quality...
                  </span>
                ) : validationReport?.isValid ? (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Quality Validated
                  </span>
                ) : (
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
                  </span>
                )}
              </div>

              {validationReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] font-bold">STATUS</span>
                    <span className="font-bold text-slate-800">{validationReport.qualityStatus}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] font-bold">RESOLUTION</span>
                    <span className="font-bold text-slate-800">{validationReport.width} x {validationReport.height}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] font-bold">LUMINANCE</span>
                    <span className="font-bold text-slate-800">{validationReport.exposureScore}/255</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] font-bold">ASPECT RATIO</span>
                    <span className="font-bold text-slate-800">{validationReport.aspectRatio} : 1</span>
                  </div>
                </div>
              )}

              {validationReport?.issues && validationReport.issues.length > 0 && (
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-0.5">
                  {validationReport.issues.map((iss, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{iss}</span>
                    </div>
                  ))}
                </div>
              )}

              {!readOnly && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isScreening || isValidating}
                    onClick={handleRunScreening}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isScreening ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Running Image Screening...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Analyze Photograph
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl(null);
                      setValidationReport(null);
                      setScreeningResult(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Screening Results Display */}
      {screeningResult && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Screening Result:</span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                screeningResult.screeningStatus === 'SCREENING_COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : screeningResult.screeningStatus === 'NON_VISUAL_DISEASE_WARNING'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : screeningResult.screeningStatus === 'MODEL_NOT_READY'
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : 'bg-slate-200 text-slate-800 border-slate-300'
              }`}>
                {screeningResult.screeningStatus === 'MODEL_NOT_READY' ? 'TRAINING PENDING' : screeningResult.screeningStatus}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Model: {screeningResult.modelArchitecture} v{screeningResult.modelVersion}
            </div>
          </div>

          {/* Non-Visual Disease Guardrail Warning */}
          {screeningResult.screeningStatus === 'NON_VISUAL_DISEASE_WARNING' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Laboratory / Physical Examination Required
              </div>
              <p className="text-[11px] leading-relaxed">
                {screeningResult.limitationsNotes[0]}
              </p>
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 font-medium text-[11px]">
                {screeningResult.recommendation}
              </div>
            </div>
          )}

          {/* Model Not Ready / Real Dataset Pending Notice */}
          {screeningResult.screeningStatus === 'MODEL_NOT_READY' && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs text-sky-950">
              <div className="flex items-center gap-2 font-black text-sky-900">
                <Info className="w-4 h-4 text-sky-700" />
                Image Quality Verified — CNN Training Pending
              </div>
              <p className="text-[11px] leading-relaxed">
                The image meets input requirements. Automated CNN inference is pending approved real-world veterinary datasets. Visual triage reference guidelines for {species} are provided below.
              </p>
              <div className="pt-1 space-y-1">
                <span className="text-[10px] font-bold text-sky-800 uppercase block">Visually Screenable Diseases for {species}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {compatibleTaxonomy
                    .filter(d => d.feasibilityTier === 'VISUAL_SCREENING_FEASIBLE')
                    .map(d => (
                      <span key={d.diseaseId} className="text-[10px] bg-white text-sky-900 px-2 py-0.5 rounded border border-sky-300 font-bold">
                        {d.commonName}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Uncertainty Rejection Notice */}
          {screeningResult.screeningStatus === 'LOW_CONFIDENCE_REJECTED' && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2 text-xs text-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                Inconclusive Visual Evidence
              </div>
              <p className="text-[11px]">
                Unable to provide a reliable image screening result. Veterinary examination is recommended.
              </p>
            </div>
          )}

          {/* Clinical Safeguard & Disclaimer */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Scientific Decision Support Notice
            </span>
            <p className="leading-relaxed">
              Image screening is an adjunct triage aid and does not constitute a certified veterinary diagnosis. Final diagnosis requires on-farm clinical examination and confirmatory laboratory testing.
            </p>
          </div>

          {/* 6. Veterinarian Review Controls */}
          {canReview && (
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-700" />
                  Veterinary Review & Verification
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200">
                  Status: {screeningResult.veterinarianReviewStatus}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                  Clinical Impression / Review Notes:
                </label>
                <textarea
                  rows={2}
                  value={vetNotesInput}
                  onChange={e => setVetNotesInput(e.target.value)}
                  placeholder="Record differential findings, lesion evaluation, or sample request orders..."
                  className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmittingVetReview}
                  onClick={() => handleSaveVetReview('AGREED')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Relevant Lesion
                </button>
                <button
                  type="button"
                  disabled={isSubmittingVetReview}
                  onClick={() => handleSaveVetReview('LAB_CONFIRMATION_ORDERED')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FlaskConical className="w-3.5 h-3.5" /> Order Confirmatory Lab Test
                </button>
                <button
                  type="button"
                  disabled={isSubmittingVetReview}
                  onClick={() => handleSaveVetReview('DISAGREED')}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" /> Disagree with Visual Impression
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handleCameraCapture}
          defaultCategory="LESION"
        />
      )}

      {/* 11-Disease Feasibility Modal */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  11-Disease Visual Feasibility Taxonomy
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scientific evaluation of photograph-based screening versus mandatory laboratory diagnostics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaxonomyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {LIVESTOCK_11_DISEASE_TAXONOMY.map(d => (
                <div
                  key={d.diseaseId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{d.commonName}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      d.feasibilityTier === 'VISUAL_SCREENING_FEASIBLE'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : d.feasibilityTier === 'STRICT_BIOHAZARD_LAB_REQUIRED'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {d.feasibilityTier.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">Visual Lesions:</strong> {d.visualLesionDescription}
                  </p>

                  <div className="text-[10px] text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                    <strong>Laboratory Protocol:</strong> {d.labTestRequirement}
                  </div>

                  {d.clinicalSafetyWarning && (
                    <div className="text-[10px] text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <strong>Safeguard:</strong> {d.clinicalSafetyWarning}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTaxonomyModal(false)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
