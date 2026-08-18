import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShop } from '../../context/ShopContext';
import { Highlight, HighlightMediaItem } from '../../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { incrementHighlightClicks } from '../../lib/firestoreService';

export const HighlightViewerModal: React.FC = () => {
  const { highlights, activeHighlight, closeHighlightViewer, openHighlightViewer, navigate } = useShop();

  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active highlight media list
  const activeMediaList: HighlightMediaItem[] = React.useMemo(() => {
    if (!activeHighlight) return [];
    if (activeHighlight.media && activeHighlight.media.length > 0) {
      return [...activeHighlight.media].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    // Fallback single media item from cover image
    return [
      {
        id: 'cover-media',
        type: 'image',
        url: activeHighlight.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
        caption: activeHighlight.title || activeHighlight.name,
        displayOrder: 1,
      },
    ];
  }, [activeHighlight]);

  const currentMedia: HighlightMediaItem | undefined = activeMediaList[currentMediaIndex];

  // List of all published highlights to allow navigating between highlights
  const publishedHighlights = React.useMemo(() => {
    return (highlights || []).filter((h) => h.published !== false);
  }, [highlights]);

  const currentHighlightIndex = React.useMemo(() => {
    if (!activeHighlight) return -1;
    return publishedHighlights.findIndex((h) => h.id === activeHighlight.id);
  }, [activeHighlight, publishedHighlights]);

  // Reset index when active highlight changes
  useEffect(() => {
    if (activeHighlight) {
      setCurrentMediaIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [activeHighlight?.id]);

  // Navigate to Next Media or Next Highlight
  const handleNext = useCallback(() => {
    if (currentMediaIndex < activeMediaList.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Move to next highlight if available, else close
      if (currentHighlightIndex >= 0 && currentHighlightIndex < publishedHighlights.length - 1) {
        openHighlightViewer(publishedHighlights[currentHighlightIndex + 1]);
      } else {
        closeHighlightViewer();
      }
    }
  }, [currentMediaIndex, activeMediaList.length, currentHighlightIndex, publishedHighlights, openHighlightViewer, closeHighlightViewer]);

  // Navigate to Previous Media or Previous Highlight
  const handlePrev = useCallback(() => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Move to previous highlight if available
      if (currentHighlightIndex > 0) {
        const prevHighlight = publishedHighlights[currentHighlightIndex - 1];
        openHighlightViewer(prevHighlight);
      } else {
        setProgress(0);
      }
    }
  }, [currentMediaIndex, currentHighlightIndex, publishedHighlights, openHighlightViewer]);

  // Handle CTA Button Click
  const handleCtaClick = () => {
    if (!activeHighlight) return;
    if (activeHighlight.id) {
      incrementHighlightClicks(activeHighlight.id);
    }
    closeHighlightViewer();
    if (activeHighlight.buttonLink) {
      navigate(activeHighlight.buttonLink);
    }
  };

  // Image / Video Progress Timer
  useEffect(() => {
    if (!activeHighlight || isPaused) return;

    if (currentMedia?.type === 'video') {
      // For video, progress is handled via onTimeUpdate event
      return;
    }

    // For images, step every 50ms for 5 seconds total (5000ms / 50ms = 100 steps)
    const intervalMs = 50;
    const step = 100 / (5000 / intervalMs);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current as NodeJS.Timeout);
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [activeHighlight, isPaused, currentMediaIndex, currentMedia?.type, handleNext]);

  // Video Time Update Callback
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && currentMedia?.type === 'video') {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeHighlight) return;
      if (e.key === 'Escape') {
        closeHighlightViewer();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHighlight, handleNext, handlePrev, closeHighlightViewer]);

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null || touchStartY === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    // Swipe down to dismiss
    if (diffY > 80 && Math.abs(diffX) < 60) {
      closeHighlightViewer();
    }
    // Horizontal swipe
    else if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  if (!activeHighlight) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-300 animate-fadeIn"
      onClick={closeHighlightViewer}
    >
      {/* Central Story Box */}
      <div
        className="relative w-full max-w-lg h-[92vh] max-h-[860px] bg-[#140205] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/40 flex flex-col justify-between select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        {/* TOP SEGMENTED PROGRESS BARS */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 pt-3 flex gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {activeMediaList.map((m, idx) => {
            let widthPercent = 0;
            if (idx < currentMediaIndex) {
              widthPercent = 100;
            } else if (idx === currentMediaIndex) {
              widthPercent = progress;
            } else {
              widthPercent = 0;
            }

            return (
              <div
                key={m.id || idx}
                className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#DFBA67] to-[#D4AF37] transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* TOP HEADER CONTROLS */}
        <div className="absolute top-7 inset-x-0 z-30 px-4 py-2 flex items-center justify-between">
          {/* Highlight Brand & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37]/60 shadow-md">
              <img
                src={activeHighlight.coverImage}
                alt={activeHighlight.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white font-serif tracking-wide drop-shadow-md">
                  {activeHighlight.name}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[10px] text-[#DFBA67] font-semibold">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono">
                {currentMediaIndex + 1} of {activeMediaList.length}
              </p>
            </div>
          </div>

          {/* Action buttons: Pause, Sound, Close */}
          <div className="flex items-center gap-2">
            {currentMedia?.type === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((m) => !m);
                }}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#DFBA67]" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused((p) => !p);
              }}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Pause/Resume"
            >
              {isPaused ? <Play className="w-4 h-4 text-[#DFBA67]" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={closeHighlightViewer}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 hover:text-[#DFBA67] transition-colors cursor-pointer"
              aria-label="Close story viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MEDIA DISPLAY AREA */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {currentMedia?.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentMedia.url}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentMedia?.url || activeHighlight.coverImage}
              alt={currentMedia?.caption || activeHighlight.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Subtle multi-layer gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

          {/* TAP ZONES (Left 30% for Prev, Right 70% for Next) */}
          <div
            className="absolute top-20 bottom-28 left-0 w-[30%] z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div
            className="absolute top-20 bottom-28 right-0 w-[70%] z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        </div>

        {/* DESKTOP PREV / NEXT CHEVRON BUTTONS */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-[#3B0C13] border border-white/20 hover:border-[#D4AF37] text-white hover:text-[#DFBA67] transition-all cursor-pointer shadow-lg"
          aria-label="Previous media"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-[#3B0C13] border border-white/20 hover:border-[#D4AF37] text-white hover:text-[#DFBA67] transition-all cursor-pointer shadow-lg"
          aria-label="Next media"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* BOTTOM DETAILS & CALL-TO-ACTION DRAWER */}
        <div className="relative z-30 p-5 bg-gradient-to-t from-black via-black/85 to-transparent space-y-3">
          {/* Media Caption if available */}
          {currentMedia?.caption && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#DFBA67] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentMedia.caption}</span>
            </div>
          )}

          {/* Highlight Title & Description */}
          {activeHighlight.title && (
            <h4 className="text-lg font-serif font-bold text-white leading-snug">
              {activeHighlight.title}
            </h4>
          )}

          {activeHighlight.description && (
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed line-clamp-2">
              {activeHighlight.description}
            </p>
          )}

          {/* CTA Button Link */}
          {activeHighlight.buttonText && (
            <div className="pt-1">
              <button
                onClick={handleCtaClick}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E2C378] to-[#B38F26] text-[#140205] text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{activeHighlight.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
