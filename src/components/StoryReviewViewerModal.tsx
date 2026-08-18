import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Star, CheckCircle, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { CustomerReviewHighlight, ReviewMediaItem } from '../types';

interface StoryReviewViewerModalProps {
  reviews: CustomerReviewHighlight[];
  initialReviewId?: string;
  onClose: () => void;
}

const IMAGE_DURATION_MS = 5000;

export const StoryReviewViewerModal: React.FC<StoryReviewViewerModalProps> = ({
  reviews,
  initialReviewId,
  onClose,
}) => {
  // Find initial review index
  const initialIndex = Math.max(
    0,
    reviews.findIndex(r => r.id === initialReviewId)
  );

  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(initialIndex);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const activeReview = reviews[currentReviewIndex] || reviews[0];
  const mediaList: ReviewMediaItem[] = (activeReview?.media && activeReview.media.length > 0)
    ? activeReview.media
    : [
        {
          id: 'fallback-media',
          type: 'image' as const,
          url: activeReview?.coverImage || '',
          order: 1,
        },
      ];

  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Function to move to next media or next review
  const handleNext = useCallback(() => {
    setProgress(0);
    if (currentMediaIndex < mediaList.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    } else {
      // Move to next customer review
      if (currentReviewIndex < reviews.length - 1) {
        setCurrentReviewIndex(prev => prev + 1);
        setCurrentMediaIndex(0);
      } else {
        // End of all stories
        onClose();
      }
    }
  }, [currentMediaIndex, mediaList.length, currentReviewIndex, reviews.length, onClose]);

  // Function to move to previous media or previous review
  const handlePrev = useCallback(() => {
    setProgress(0);
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    } else {
      // Move to previous customer review
      if (currentReviewIndex > 0) {
        const prevReviewIndex = currentReviewIndex - 1;
        const prevReviewMedia = reviews[prevReviewIndex]?.media || [];
        setCurrentReviewIndex(prevReviewIndex);
        setCurrentMediaIndex(Math.max(0, prevReviewMedia.length - 1));
      }
    }
  }, [currentMediaIndex, currentReviewIndex, reviews]);

  // Reset media index when switching reviews
  useEffect(() => {
    setProgress(0);
  }, [currentReviewIndex, currentMediaIndex]);

  // Timer loop for Images
  useEffect(() => {
    if (!currentMedia || currentMedia.type === 'video') return;

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - (progress / 100) * IMAGE_DURATION_MS;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentPct = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100);
      setProgress(currentPct);

      if (elapsed >= IMAGE_DURATION_MS) {
        clearInterval(interval);
        handleNext();
      }
    }, 50);

    timerRef.current = interval;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentMedia, isPaused, handleNext]);

  // Video progress tracking
  useEffect(() => {
    if (!currentMedia || currentMedia.type !== 'video' || !videoRef.current) return;

    const videoEl = videoRef.current;

    const onTimeUpdate = () => {
      if (videoEl.duration && !isNaN(videoEl.duration) && videoEl.duration > 0) {
        const pct = (videoEl.currentTime / videoEl.duration) * 100;
        setProgress(pct);
      }
    };

    const onLoadedMetadata = () => {
      setVideoDuration(videoEl.duration || 0);
      if (!isPaused) {
        videoEl.play().catch(() => {
          // Auto-play was prevented (browser policy), keep muted
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        });
      }
    };

    const onEnded = () => {
      setProgress(100);
      handleNext();
    };

    videoEl.addEventListener('timeupdate', onTimeUpdate);
    videoEl.addEventListener('loadedmetadata', onLoadedMetadata);
    videoEl.addEventListener('ended', onEnded);

    if (!isPaused) {
      videoEl.play().catch(() => {});
    }

    return () => {
      videoEl.removeEventListener('timeupdate', onTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoEl.removeEventListener('ended', onEnded);
    };
  }, [currentMedia, isPaused, handleNext]);

  // Keyboard navigation & Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Handle Touch Swipes for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Swipe down to close
    if (diffY < -80 && Math.abs(diffX) < 60) {
      onClose();
      return;
    }

    // Swipe left (next review)
    if (diffX > 50 && Math.abs(diffY) < 60) {
      if (currentReviewIndex < reviews.length - 1) {
        setCurrentReviewIndex(prev => prev + 1);
        setCurrentMediaIndex(0);
      } else {
        onClose();
      }
      return;
    }

    // Swipe right (prev review)
    if (diffX < -50 && Math.abs(diffY) < 60) {
      if (currentReviewIndex > 0) {
        setCurrentReviewIndex(prev => prev - 1);
        setCurrentMediaIndex(0);
      }
      return;
    }
  };

  // Screen tap zones (left 30% for prev, right 70% for next)
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid triggering if clicked on top controls, audio button or close button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-story-tap')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;

    if (clickRatio < 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (!activeReview) return null;

  return (
    <div
      id="story-viewer-modal"
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center select-none"
      onClick={onClose}
    >
      {/* Desktop Previous Button */}
      {currentReviewIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentReviewIndex > 0) {
              setCurrentReviewIndex(prev => prev - 1);
              setCurrentMediaIndex(0);
            }
          }}
          className="hidden md:flex absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-95 shadow-xl z-20 cursor-pointer"
          title="Previous customer review"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Story Container (9:16 aspect ratio frame) */}
      <div
        className="relative w-full h-full max-w-[430px] md:h-[92vh] md:max-h-[860px] bg-[#1a0508] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border md:border-[#C5A059]/30"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* MEDIA BACKGROUND / VIEWER */}
        <div
          className="absolute inset-0 z-0 flex items-center justify-center bg-black cursor-pointer"
          onClick={handleScreenClick}
        >
          {currentMedia?.type === 'video' ? (
            <video
              ref={videoRef}
              key={currentMedia.url}
              src={currentMedia.url}
              playsInline
              autoPlay
              muted={isMuted}
              className="w-full h-full object-cover md:object-contain bg-black"
            />
          ) : (
            <img
              key={currentMedia?.url}
              src={currentMedia?.url || activeReview.coverImage}
              alt={activeReview.customerName}
              className="w-full h-full object-cover md:object-contain bg-black"
              loading="eager"
            />
          )}

          {/* Pause Indicator overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none transition-opacity">
              <div className="w-14 h-14 rounded-full bg-black/60 text-[#DFBA67] flex items-center justify-center border border-[#D4AF37]/40 shadow-lg">
                <Pause className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* TOP OVERLAYS (Progress Bars + Customer Profile Bar + Controls) */}
        <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          {/* Progress Bar Segments */}
          <div className="flex items-center gap-1.5 mb-3.5">
            {mediaList.map((m, idx) => {
              let fillWidth = '0%';
              if (idx < currentMediaIndex) {
                fillWidth = '100%';
              } else if (idx === currentMediaIndex) {
                fillWidth = `${progress}%`;
              }

              return (
                <div
                  key={m.id || idx}
                  className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#DFBA67] to-[#F3E5AB] rounded-full transition-all duration-75"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Customer Header & Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#5B0F15] shrink-0 shadow-md">
                <img
                  src={activeReview.coverImage || currentMedia?.url}
                  alt={activeReview.customerName}
                  className="w-full h-full object-cover rounded-full border border-white/80"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white font-semibold text-sm truncate tracking-tight">
                    {activeReview.customerName}
                  </h3>
                  {activeReview.isVerified !== false && (
                    <span
                      title="Verified Buyer"
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/15 px-1.5 py-0.5 rounded border border-[#4ade80]/30 shrink-0"
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-200/90">
                  <div className="flex items-center text-[#DFBA67]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (activeReview.rating || 5)
                            ? 'fill-[#DFBA67] text-[#DFBA67]'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  {activeReview.location && (
                    <span className="text-white/60 text-[11px] truncate">
                      • {activeReview.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons (Mute / Pause / Close) */}
            <div className="flex items-center gap-2 shrink-0">
              {currentMedia?.type === 'video' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM OVERLAY (Customer Review Card & Caption) */}
        <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto">
          <div className="bg-[#2D0B12]/85 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#D4AF37]/40 shadow-2xl">
            {currentMedia?.caption && (
              <p className="text-xs font-semibold text-[#DFBA67] mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA67] inline-block animate-pulse" />
                {currentMedia.caption}
              </p>
            )}

            <p className="text-white/90 text-xs sm:text-sm italic line-clamp-3 leading-relaxed">
              "{activeReview.reviewText}"
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10 text-[11px] text-white/70">
              <span className="text-[#DFBA67] font-medium tracking-wide">
                LUXUE CUSTOMER VERIFIED
              </span>
              <span className="text-white/50">
                {currentMediaIndex + 1} of {mediaList.length} media
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Next Button */}
      {currentReviewIndex < reviews.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentReviewIndex < reviews.length - 1) {
              setCurrentReviewIndex(prev => prev + 1);
              setCurrentMediaIndex(0);
            }
          }}
          className="hidden md:flex absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-95 shadow-xl z-20 cursor-pointer"
          title="Next customer review"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
