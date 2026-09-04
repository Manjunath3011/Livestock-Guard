import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Eye,
  Check,
  AlertTriangle,
  Info,
  Shield,
  Clock,
  Sparkles,
  Tag,
  ZoomIn,
  X,
  UserCheck
} from 'lucide-react';
import { AnimalPhoto, AnimalPhotoType, Role } from '../../types';
import { CameraCapture, CapturedPhotoPayload } from './CameraCapture';
import { photoStorageService } from '../../services/PhotoStorageService';

interface PhotoEvidenceSectionProps {
  photos: AnimalPhoto[];
  onChange?: (updatedPhotos: AnimalPhoto[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
  currentUserRole?: Role;
  animalId?: string;
  caseId?: string;
  isOffline?: boolean;
  allowVetReview?: boolean;
  onVetReviewUpdate?: (photoId: string, status: 'RELEVANT' | 'NOT_RELEVANT' | 'NEED_BETTER_PHOTO', notes?: string) => void;
  onReviewPhoto?: (photoId: string, status: 'RELEVANT' | 'NOT_RELEVANT' | 'NEED_BETTER_PHOTO', notes?: string) => void;
}

export const PhotoEvidenceSection: React.FC<PhotoEvidenceSectionProps> = ({
  photos = [],
  onChange,
  maxPhotos = 5,
  readOnly = false,
  currentUserRole = 'FARMER',
  animalId = 'anm_unassigned',
  caseId,
  isOffline = false,
  allowVetReview = false,
  onVetReviewUpdate,
  onReviewPhoto
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AnimalPhotoType>('SYMPTOM');
  const [previewPhoto, setPreviewPhoto] = useState<AnimalPhoto | null>(null);
  const [reviewModalPhoto, setReviewModalPhoto] = useState<AnimalPhoto | null>(null);
  const [vetReviewNotes, setVetReviewNotes] = useState<string>('');

  const isFieldWorker = currentUserRole === 'FIELD_WORKER';
  const isVet = currentUserRole === 'VETERINARIAN';

  const handlePhotoCaptured = async (payload: CapturedPhotoPayload) => {
    const photoId = `pho_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const newPhoto: AnimalPhoto = {
      id: photoId,
      animalId,
      caseId,
      photoType: payload.category,
      storageReference: payload.dataUrl,
      thumbnailReference: payload.thumbnailUrl,
      capturedAt: nowIso,
      uploadedAt: nowIso,
      capturedOffline: payload.capturedOffline ?? isOffline,
      uploadedBy: currentUserRole,
      uploaderRole: currentUserRole,
      source: isVet ? 'VET' : isFieldWorker ? 'FIELD_WORKER' : 'FARMER',
      qualityStatus: payload.qualityStatus,
      label: payload.category,
      metadata: {
        width: payload.width,
        height: payload.height,
        fileSize: payload.compressedSize
      }
    };

    // Save to photo service storage engine
    await photoStorageService.savePhoto(newPhoto, payload.dataUrl);

    if (onChange) {
      onChange([...photos, newPhoto]);
    }
  };

  const handleRemovePhoto = async (photoId: string) => {
    await photoStorageService.deletePhoto(photoId);
    if (onChange) {
      onChange(photos.filter(p => p.id !== photoId));
    }
    if (previewPhoto?.id === photoId) {
      setPreviewPhoto(null);
    }
  };

  const handleCategoryChange = (photoId: string, newCategory: AnimalPhotoType) => {
    if (onChange) {
      const updated = photos.map(p =>
        p.id === photoId ? { ...p, photoType: newCategory, label: newCategory } : p
      );
      onChange(updated);
    }
  };

  const handleSaveVetReview = async (status: 'RELEVANT' | 'NOT_RELEVANT' | 'NEED_BETTER_PHOTO') => {
    if (!reviewModalPhoto) return;
    const updated = await photoStorageService.updateReviewStatus(
      reviewModalPhoto.id,
      status,
      vetReviewNotes
    );
    if (onVetReviewUpdate) {
      onVetReviewUpdate(reviewModalPhoto.id, status, vetReviewNotes);
    }
    if (onReviewPhoto) {
      onReviewPhoto(reviewModalPhoto.id, status, vetReviewNotes);
    }
    if (onChange && updated) {
      onChange(photos.map(p => (p.id === updated.id ? updated : p)));
    }
    setReviewModalPhoto(null);
    setVetReviewNotes('');
  };

  const getSourceBadge = (source?: string, role?: string) => {
    const s = source || role || 'FARMER';
    if (s === 'FIELD_WORKER') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
          FIELD VERIFICATION PHOTO
        </span>
      );
    }
    if (s === 'VET' || s === 'VETERINARIAN') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
          VETERINARY CLINICAL PHOTO
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
        FARMER PHOTO
      </span>
    );
  };

  const getCategoryName = (cat: AnimalPhotoType) => {
    switch (cat) {
      case 'ANIMAL_OVERVIEW':
        return 'Full Animal';
      case 'ANIMAL_ID':
        return 'Ear Tag / ID';
      case 'SYMPTOM':
        return 'Symptom';
      case 'LESION':
        return 'Lesion / Ulcer';
      default:
        return 'Surroundings';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Clinical Photographic Evidence</span>
            <span className="text-xs font-normal text-slate-500">
              ({photos.length} of {maxPhotos} attached)
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clear photos of visible lesions, mouth ulcers, or ear tags strengthen report credibility and assist doctor triage.
          </p>
        </div>

        {!readOnly && photos.length < maxPhotos && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('SYMPTOM');
                setIsCameraOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Safety & Medical Boundary Notice */}
      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold">Clinical Decision-Support Aid:</span> Photographs provide valuable visual context for inspecting veterinarians and field officers. They do not replace laboratory diagnostics or confirmatory viral testing.
        </div>
      </div>

      {/* Photo Cards Grid */}
      {photos.length === 0 ? (
        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No photographs attached yet (Optional)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
              If the animal displays visible mouth blisters, salivation, or lameness, taking a photograph will help veterinary officers prioritize care.
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs transition"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              Open Camera / Upload
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id || index}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Photo Thumbnail Container */}
              <div
                className="relative aspect-4/3 bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setPreviewPhoto(photo)}
              >
                <img
                  src={photo.thumbnailReference || photo.storageReference}
                  alt={photo.label || 'Animal Evidence'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Top overlay badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  {getSourceBadge(photo.source, photo.uploaderRole)}
                  <span className="p-1 rounded bg-black/60 text-white backdrop-blur-xs text-[10px]">
                    <ZoomIn className="w-3 h-3" />
                  </span>
                </div>

                {/* Quality warning badge */}
                {photo.qualityStatus === 'BLURRY_OR_DARK' && (
                  <div className="absolute bottom-2 left-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Low Light
                  </div>
                )}
              </div>

              {/* Card Meta & Controls */}
              <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      {getCategoryName(photo.photoType)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {photo.metadata?.fileSize
                        ? `${(photo.metadata.fileSize / 1024).toFixed(0)} KB`
                        : 'Compressed'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(photo.capturedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {photo.capturedOffline ? 'Captured Offline' : 'Online Sync'}
                  </p>

                  {photo.vetReviewStatus && (
                    <div className="mt-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Vet Status:{' '}
                      </span>
                      <span
                        className={`font-bold ${
                          photo.vetReviewStatus === 'RELEVANT'
                            ? 'text-emerald-600'
                            : photo.vetReviewStatus === 'NEED_BETTER_PHOTO'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {photo.vetReviewStatus.replace(/_/g, ' ')}
                      </span>
                      {photo.vetNotes && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                          "{photo.vetNotes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {!readOnly && (
                    <select
                      value={photo.photoType}
                      onChange={e => handleCategoryChange(photo.id, e.target.value as AnimalPhotoType)}
                      className="text-[11px] py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <option value="SYMPTOM">Symptom</option>
                      <option value="LESION">Lesion</option>
                      <option value="ANIMAL_OVERVIEW">Full Animal</option>
                      <option value="ANIMAL_ID">Ear Tag / ID</option>
                      <option value="OTHER">Other</option>
                    </select>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {allowVetReview && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalPhoto(photo);
                          setVetReviewNotes(photo.vetNotes || '');
                        }}
                        className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        Vet Review
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        defaultCategory={selectedCategory}
        isOffline={isOffline}
      />

      {/* Fullscreen Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {getSourceBadge(previewPhoto.source, previewPhoto.uploaderRole)}
                <span className="font-bold text-xs">
                  {getCategoryName(previewPhoto.photoType)}
                </span>
                <span className="text-xs text-slate-400">
                  • Captured {new Date(previewPhoto.capturedAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-auto">
              <img
                src={previewPhoto.storageReference}
                alt="Full Evidence Preview"
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Resolution:</span>{' '}
                {previewPhoto.metadata?.width}×{previewPhoto.metadata?.height}px •{' '}
                <span className="font-semibold text-white">Size:</span>{' '}
                {previewPhoto.metadata?.fileSize
                  ? `${(previewPhoto.metadata.fileSize / 1024).toFixed(0)} KB (Compressed)`
                  : 'Optimized'}
              </div>
              <div className="text-[11px] text-slate-400">
                EXIF GPS tags stripped for privacy • Visual clinical record
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Veterinarian Clinical Review Modal */}
      {reviewModalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setReviewModalPhoto(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Veterinary Photo Review
              </h3>
              <button
                onClick={() => setReviewModalPhoto(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <img
                src={reviewModalPhoto.storageReference}
                alt="Review Target"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Veterinary Clinical Assessment Note
              </label>
              <textarea
                rows={2}
                value={vetReviewNotes}
                onChange={e => setVetReviewNotes(e.target.value)}
                placeholder="E.g. Vesicles on dental pad consistent with early vesicular disease; recommend swab collection."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Mark Evidence Relevance:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveVetReview('RELEVANT')}
                  className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Relevant</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveVetReview('NEED_BETTER_PHOTO')}
                  className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex flex-col items-center gap-1 shadow-sm transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Need Better</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveVetReview('NOT_RELEVANT')}
                  className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center gap-1 transition"
                >
                  <X className="w-4 h-4" />
                  <span>Not Relevant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
