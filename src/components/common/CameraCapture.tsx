import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Check,
  X,
  Upload,
  AlertTriangle,
  Lightbulb,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { AnimalPhotoType } from '../../types';
import {
  photoStorageService,
  ImageProcessingResult,
  PHOTO_GUIDELINES
} from '../../services/PhotoStorageService';

export type CameraStatus =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'ACTIVE'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'STOPPED';

export interface CapturedPhotoPayload {
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  compressedSize: number;
  qualityStatus: 'GOOD' | 'BLURRY_OR_DARK' | 'POOR';
  qualityFeedback: string;
  category: AnimalPhotoType;
  capturedOffline?: boolean;
}

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (payload: CapturedPhotoPayload) => void;
  defaultCategory?: AnimalPhotoType;
  title?: string;
  isOffline?: boolean;
}

interface CategoryOption {
  id: AnimalPhotoType;
  label: string;
  targetGuidance: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'SYMPTOM',
    label: 'Clinical Symptom',
    targetGuidance: 'Show the visible symptom clearly.'
  },
  {
    id: 'LESION',
    label: 'Lesion / Ulcer',
    targetGuidance: 'Focus on the affected skin area.'
  },
  {
    id: 'ANIMAL_OVERVIEW',
    label: 'Full Animal',
    targetGuidance: 'Include the complete animal in the frame.'
  },
  {
    id: 'ANIMAL_ID',
    label: 'Ear Tag / ID',
    targetGuidance: 'Make the identification tag clearly readable.'
  },
  {
    id: 'OTHER',
    label: 'Surroundings',
    targetGuidance: "Show the animal's surroundings, pen, feed/water area, or other relevant conditions."
  }
];

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  defaultCategory = 'SYMPTOM',
  title = 'Capture Animal Evidence Photo',
  isOffline = false
}) => {
  const [category, setCategory] = useState<AnimalPhotoType>(defaultCategory);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('IDLE');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableVideoDevices, setAvailableVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<ImageProcessingResult | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [showGuidance, setShowGuidance] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks and release hardware safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log(
        '[CameraCapture] Stopping',
        streamRef.current.getTracks().length,
        'camera track(s)'
      );
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.warn('[CameraCapture] Error stopping track:', err);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setCameraStatus('STOPPED');
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Request camera access and attach stream to video element
  const startCamera = useCallback(
    async (desiredFacing: 'environment' | 'user' = facingMode) => {
      // Clean up previous stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => {
          try {
            t.stop();
          } catch (e) {}
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setErrorMessage(null);
      setCameraStatus('REQUESTING_PERMISSION');

      console.log('[CameraCapture] Requesting camera with facingMode:', desiredFacing);

      // Check for secure context (HTTPS or localhost)
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        const isLocalhost =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';
        if (!isLocalhost) {
          console.warn('[CameraCapture] Camera access requires a secure context (HTTPS).');
          setCameraStatus('ERROR');
          setErrorMessage(
            'Camera access requires a secure connection (HTTPS). Please open the deployed HTTPS application or choose a photo from your gallery.'
          );
          return;
        }
      }

      // Check mediaDevices support
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        console.warn('[CameraCapture] navigator.mediaDevices.getUserMedia is unavailable');
        setCameraStatus('UNAVAILABLE');
        setErrorMessage('Camera is not available on this device or browser.');
        return;
      }

      try {
        let mediaStream: MediaStream;

        // Step 1: Request preferred rear camera with facingMode: { ideal: "environment" }
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: desiredFacing }
            },
            audio: false
          });
          console.log('[CameraCapture] getUserMedia succeeded with ideal facingMode:', desiredFacing);
        } catch (idealErr: any) {
          // If permission denied, do not retry
          if (
            idealErr.name === 'NotAllowedError' ||
            idealErr.name === 'PermissionDeniedError'
          ) {
            throw idealErr;
          }
          console.warn(
            '[CameraCapture] Specific facingMode constraint failed, falling back to video: true',
            idealErr.name
          );
          // Step 2: Graceful fallback to video: true
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          console.log('[CameraCapture] getUserMedia fallback to video: true succeeded');
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);

        // Inspect video track capabilities (torch, labels)
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          console.log(
            '[CameraCapture] Active video track:',
            videoTrack.label,
            'enabled:',
            videoTrack.enabled,
            'readyState:',
            videoTrack.readyState
          );
          try {
            const capabilities: any = videoTrack.getCapabilities
              ? videoTrack.getCapabilities()
              : {};
            if (capabilities.torch) {
              setHasTorch(true);
            }
          } catch (capErr) {
            console.warn('[CameraCapture] Could not query track capabilities:', capErr);
          }
        }

        // Detect available cameras on device to conditionally show switch button
        try {
          if (navigator.mediaDevices.enumerateDevices) {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
            console.log('[CameraCapture] Detected video inputs count:', videoInputs.length);
            setAvailableVideoDevices(videoInputs);
          }
        } catch (enumErr) {
          console.warn('[CameraCapture] enumerateDevices warning:', enumErr);
        }

        // Attach stream directly to video element if already mounted
        const videoEl = videoRef.current;
        if (videoEl) {
          console.log('[CameraCapture] Attaching MediaStream to video element');
          if (videoEl.srcObject !== mediaStream) {
            videoEl.srcObject = mediaStream;
          }

          // Listen for metadata load to start playback safely
          videoEl.onloadedmetadata = () => {
            console.log(
              '[CameraCapture] Video metadata loaded:',
              videoEl.videoWidth,
              'x',
              videoEl.videoHeight
            );
            videoEl
              .play()
              .then(() => {
                console.log('[CameraCapture] Video playback started successfully');
                setCameraStatus('ACTIVE');
              })
              .catch(playErr => {
                console.warn('[CameraCapture] video.play() was interrupted:', playErr);
                if (videoEl.readyState >= 2) {
                  setCameraStatus('ACTIVE');
                }
              });
          };

          // Also trigger immediate play() for fast browsers
          videoEl
            .play()
            .then(() => {
              setCameraStatus('ACTIVE');
            })
            .catch(playErr => {
              console.warn(
                '[CameraCapture] Immediate play call awaiting metadata:',
                playErr.message
              );
            });
        } else {
          console.log(
            '[CameraCapture] Video element not yet mounted in DOM; stream cached in ref for mount effect'
          );
        }
      } catch (err: any) {
        console.error('[CameraCapture] getUserMedia error occurred:', err.name, err.message);
        const inIframe = typeof window !== 'undefined' && window.self !== window.top;

        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
          setCameraStatus('DENIED');
          if (inIframe) {
            setErrorMessage(
              'Camera access may be restricted in this preview. Open the deployed HTTPS application to use the device camera.'
            );
          } else {
            setErrorMessage('Camera permission is required only when taking a photo.');
          }
        } else if (
          err.name === 'NotFoundError' ||
          err.name === 'DevicesNotFoundError'
        ) {
          setCameraStatus('UNAVAILABLE');
          setErrorMessage('No camera was found on this device.');
        } else if (
          err.name === 'NotReadableError' ||
          err.name === 'TrackStartError'
        ) {
          setCameraStatus('ERROR');
          setErrorMessage(
            'Camera hardware is in use by another application. Please close other camera tabs and try again.'
          );
        } else {
          setCameraStatus('ERROR');
          setErrorMessage('Camera preview could not be started.');
        }
      }
    },
    [facingMode]
  );

  // Modal lifecycle: open/close and ensure video element is mounted before starting camera
  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      setCameraStatus('IDLE');
      // Allow modal DOM to mount completely before requesting stream
      const timer = window.setTimeout(() => {
        startCamera(facingMode);
      }, 60);

      return () => {
        window.clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, facingMode, startCamera, stopCamera]);

  // Reactive effect: ensure video element receives stream and plays whenever stream or DOM element is ready
  useEffect(() => {
    const videoEl = videoRef.current;
    const currentStream = streamRef.current;

    if (videoEl && currentStream && !capturedPreview) {
      if (videoEl.srcObject !== currentStream) {
        console.log('[CameraCapture] Syncing stream to videoRef in reactive effect');
        videoEl.srcObject = currentStream;
      }
      videoEl
        .play()
        .then(() => {
          setCameraStatus('ACTIVE');
        })
        .catch(playErr => {
          console.warn('[CameraCapture] Reactive effect video.play() error:', playErr);
          if (videoEl.readyState >= 2) {
            setCameraStatus('ACTIVE');
          }
        });
    }
  }, [stream, capturedPreview]);

  // Flip rear/front camera
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle flash/torch if supported by hardware
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('[CameraCapture] Torch toggle failed:', e);
      }
    }
  };

  // Capture video frame onto canvas and process image
  const handleSnap = async () => {
    if (!videoRef.current || cameraStatus !== 'ACTIVE') {
      console.warn('[CameraCapture] Cannot capture: video is not ACTIVE');
      return;
    }
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('[CameraCapture] Video dimensions 0, awaiting frame');
      return;
    }

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D canvas context');

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (!rawDataUrl || rawDataUrl === 'data:,' || rawDataUrl.length < 100) {
        throw new Error('Captured image frame was empty');
      }

      // Process, compress, and check visual quality
      const processed = await photoStorageService.processImage(rawDataUrl, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8
      });

      if (!processed.compressedDataUrl) {
        throw new Error('Image compression pipeline produced invalid output');
      }

      // Temporarily stop camera tracks during preview to save battery and mobile performance
      stopCamera();
      setCapturedPreview(processed);
    } catch (e: any) {
      console.error('[CameraCapture] Error capturing photo:', e);
      alert('Failed to capture photo frame: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Gallery file selection fallback
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Selected image exceeds 20MB limit. Please choose a smaller photo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const processed = await photoStorageService.processImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8
      });
      stopCamera();
      setCapturedPreview(processed);
    } catch (err: any) {
      console.error('[CameraCapture] Error loading file:', err);
      alert('Error loading image file: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Retake photo: clear preview and restart live camera
  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera(facingMode);
  };

  // Confirm photo: pass payload to parent handler
  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;

    onPhotoCaptured({
      dataUrl: capturedPreview.compressedDataUrl,
      thumbnailUrl: capturedPreview.thumbnailDataUrl,
      width: capturedPreview.width,
      height: capturedPreview.height,
      fileSize: capturedPreview.originalSize,
      compressedSize: capturedPreview.compressedSize,
      qualityStatus: capturedPreview.qualityStatus,
      qualityFeedback: capturedPreview.qualityFeedback,
      category,
      capturedOffline: isOffline
    });

    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  const currentCategoryObj =
    CATEGORY_OPTIONS.find(c => c.id === category) || CATEGORY_OPTIONS[0];
  const currentGuideline = PHOTO_GUIDELINES[category] || PHOTO_GUIDELINES['SYMPTOM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl max-w-xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{title}</h3>
              <p className="text-xs text-slate-400">
                Decision-support visual evidence • EXIF metadata stripped for privacy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close camera modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pill Selector (Preserving All Original Options) */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {CATEGORY_OPTIONS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                category === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-slate-950 min-h-[320px] max-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Optimizing and Compressing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-emerald-300">
                Optimizing & compressing photo...
              </p>
            </div>
          )}

          {/* Captured Preview Mode */}
          {capturedPreview ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
              <img
                src={capturedPreview.compressedDataUrl}
                alt="Captured Preview"
                className="max-h-[340px] max-w-full rounded-xl object-contain shadow-lg border border-slate-800"
              />

              {/* Quality & Compression Feedback Badge */}
              <div className="mt-3 w-full max-w-md bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {capturedPreview.qualityStatus === 'GOOD' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Check className="w-4 h-4" /> Lighting & Quality Good
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <AlertTriangle className="w-4 h-4" /> Photo may be difficult to review. Retake?
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {capturedPreview.width}×{capturedPreview.height}px •{' '}
                    {(capturedPreview.compressedSize / 1024).toFixed(0)} KB
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {capturedPreview.qualityFeedback}
                </p>
                {category === 'ANIMAL_ID' && (
                  <div className="mt-1 p-2 rounded bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300">
                    <strong>Identification Check:</strong> Verify ear tag digits are clearly legible before confirming.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Camera / Black Screen Protection View */
            <div className="relative w-full h-full min-h-[320px] flex items-center justify-center bg-black">
              {/* The Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  console.log(
                    '[CameraCapture] onLoadedMetadata event triggered:',
                    videoRef.current?.videoWidth,
                    videoRef.current?.videoHeight
                  );
                  if (videoRef.current) {
                    videoRef.current
                      .play()
                      .then(() => setCameraStatus('ACTIVE'))
                      .catch(e =>
                        console.warn('[CameraCapture] onLoadedMetadata play catch:', e)
                      );
                  }
                }}
                onPlay={() => {
                  console.log('[CameraCapture] onPlay event triggered');
                  setCameraStatus('ACTIVE');
                }}
                onError={e => {
                  console.error('[CameraCapture] Video element onError:', e);
                  setCameraStatus('ERROR');
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraStatus === 'ACTIVE' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* State 1: Requesting Permission / Starting */}
              {cameraStatus === 'REQUESTING_PERMISSION' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xs text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Starting camera...</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Requesting camera access from your browser to capture animal visual evidence.
                    </p>
                  </div>
                </div>
              )}

              {/* State 2: Permission Denied */}
              {cameraStatus === 'DENIED' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      Camera Permission Denied
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                      {errorMessage ||
                        'Camera permission is required only when taking a photo.'}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose from Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        onClose();
                      }}
                      className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      Continue Without Photo
                    </button>
                  </div>
                </div>
              )}

              {/* State 3: Camera Unavailable / Not Found */}
              {cameraStatus === 'UNAVAILABLE' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      Camera Unavailable
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                      {errorMessage || 'No camera was found on this device.'}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose from Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        onClose();
                      }}
                      className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      Continue Without Photo
                    </button>
                  </div>
                </div>
              )}

              {/* State 4: Error / Preview Failed */}
              {cameraStatus === 'ERROR' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      Camera preview could not be started
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                      {errorMessage || 'Camera preview could not be started.'}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose from Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        onClose();
                      }}
                      className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      Continue Without Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Active Framing Reticle & Target Area Guidance */}
              {cameraStatus === 'ACTIVE' && (
                <>
                  <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3 z-10">
                    <div className="flex justify-between items-start text-[10px] font-mono text-emerald-300/80 uppercase">
                      <span>TARGET AREA</span>
                      <span>{currentCategoryObj.label}</span>
                    </div>
                    <div className="text-center">
                      <span className="bg-slate-900/85 text-emerald-300 px-3.5 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-xs border border-emerald-500/30 shadow-md">
                        {currentCategoryObj.targetGuidance}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-emerald-400/60 font-mono">
                      <span>+</span>
                      <span>+</span>
                    </div>
                  </div>

                  {/* Stream Controls Overlay (Torch & Multiple-Camera Switch) */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                          isTorchOn
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'
                        }`}
                        title="Toggle Flash / Torch"
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                    )}
                    {/* Only show switch camera button if multiple cameras are detected */}
                    {availableVideoDevices.length > 1 && (
                      <button
                        type="button"
                        onClick={flipCamera}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-slate-700/60 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-md"
                        title="Switch Front / Rear Camera"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Switch Camera</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Guidance Collapsible Bar */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowGuidance(!showGuidance)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Veterinary Photo Tips ({currentGuideline.title})</span>
            </button>
            <span className="text-[10px] text-slate-500">
              Optional evidence • Early screening aid
            </span>
          </div>

          {showGuidance && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 animate-in fade-in duration-150">
              <p className="text-[11px] text-slate-300 font-medium">
                {currentGuideline.sampleTips}
              </p>
              <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5">
                {currentGuideline.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* Hidden File Input for Gallery Fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {capturedPreview ? (
            /* Preview Action Buttons */
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Use This Photo
              </button>
            </>
          ) : (
            /* Live Stream Action Buttons */
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-2 transition cursor-pointer"
                title="Upload from gallery / storage"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Choose from Gallery</span>
              </button>

              {/* Main Shutter Capture Button */}
              <button
                type="button"
                onClick={handleSnap}
                disabled={cameraStatus !== 'ACTIVE'}
                className={`w-14 h-14 rounded-full border-4 border-white flex items-center justify-center transition shadow-lg ${
                  cameraStatus !== 'ACTIVE'
                    ? 'opacity-30 cursor-not-allowed bg-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 cursor-pointer'
                }`}
                aria-label="Capture Photo"
              >
                <div className="w-10 h-10 rounded-full bg-white/95" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-xs transition cursor-pointer"
              >
                Skip / Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
