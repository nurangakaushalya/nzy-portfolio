import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown, Volume2, VolumeX, Play } from 'lucide-react';
import { SHOWREEL_CONFIG } from '../config/showreel';

interface ShowreelHeroProps {
  onExploreClick: () => void;
  isOtherVideoPlaying?: boolean;
}

export const ShowreelHero: React.FC<ShowreelHeroProps> = ({
  onExploreClick,
  isOtherVideoPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Always initialize unmuted as requested ("Keep the showreel unmute when loading the site and after refreshing the site as well")
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasAutoplayFailed, setHasAutoplayFailed] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Track if user explicitly clicked the mute button during the current viewing session
  const userManuallyMutedRef = useRef<boolean>(false);
  // Track if video was playing before being interrupted by visibility change or external modal
  const wasPlayingBeforeInterruptionRef = useRef<boolean>(true);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle video element play / pause / volume listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolume);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolume);
    };
  }, []);

  const unmuteAndPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    userManuallyMutedRef.current = false;
    video.muted = false;
    video.volume = 1.0;
    setIsMuted(false);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasAutoplayFailed(false);
        })
        .catch(() => {});
    }
  }, []);

  // Initial playback attempt: always start unmuted on site load and after refresh
  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setHasAutoplayFailed(true);
      }
      return;
    }

    // Always attempt unmuted playback with full volume from the start
    video.muted = false;
    video.volume = 1.0;
    setIsMuted(false);

    let unlockCleanup: (() => void) | null = null;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          setHasAutoplayFailed(false);
        })
        .catch(() => {
          // If browser policy temporarily blocks unmuted autoplay on initial refresh without interaction,
          // start muted playback so the visual showreel rolls seamlessly:
          video.muted = true;
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setHasAutoplayFailed(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setHasAutoplayFailed(true);
            });

          // And immediately arm global one-time gesture listeners to unmute at the earliest possible instant
          const unlockAudio = () => {
            if (userManuallyMutedRef.current) return;
            const vid = videoRef.current;
            if (vid) {
              vid.muted = false;
              vid.volume = 1.0;
              setIsMuted(false);
              vid.play().catch(() => {});
            }
            if (unlockCleanup) {
              unlockCleanup();
              unlockCleanup = null;
            }
          };

          const gestureEvents: (keyof WindowEventMap)[] = [
            'pointerdown',
            'mousedown',
            'touchstart',
            'keydown',
            'wheel',
            'scroll',
            'click',
          ];

          gestureEvents.forEach((evt) => {
            window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
            document.addEventListener(evt, unlockAudio, { capture: true, passive: true });
          });

          unlockCleanup = () => {
            gestureEvents.forEach((evt) => {
              window.removeEventListener(evt, unlockAudio, true);
              document.removeEventListener(evt, unlockAudio, true);
            });
          };
        });
    }

    return () => {
      if (unlockCleanup) {
        unlockCleanup();
      }
    };
  }, [prefersReducedMotion]);

  // Handle external video playing (e.g. project modal open)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOtherVideoPlaying) {
      if (!video.paused) {
        wasPlayingBeforeInterruptionRef.current = true;
        video.pause();
      }
    } else {
      if (wasPlayingBeforeInterruptionRef.current) {
        video.play().catch(() => {});
      }
    }
  }, [isOtherVideoPlaying]);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        if (!video.paused) {
          wasPlayingBeforeInterruptionRef.current = true;
          video.pause();
        }
      } else {
        if (wasPlayingBeforeInterruptionRef.current && !isOtherVideoPlaying) {
          video.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOtherVideoPlaying]);

  // IntersectionObserver to pause when hero leaves viewport
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 0.25) {
            if (!video.paused) {
              wasPlayingBeforeInterruptionRef.current = true;
              video.pause();
            }
          } else {
            if (
              wasPlayingBeforeInterruptionRef.current &&
              !isOtherVideoPlaying &&
              !document.hidden
            ) {
              video.play().catch(() => {});
            }
          }
        });
      },
      {
        threshold: [0, 0.25],
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isOtherVideoPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      userManuallyMutedRef.current = false;
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
      video.play().catch(() => {});
    } else {
      userManuallyMutedRef.current = true;
      video.muted = true;
      setIsMuted(true);
    }
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Studio Showreel Hero"
      onClick={() => {
        if (isMuted) {
          unmuteAndPlay();
        }
      }}
      className="relative w-full h-[calc(100svh-var(--header-height,4rem))] min-h-[460px] max-h-[1200px] bg-black overflow-hidden flex flex-col justify-end select-none"
    >
      {/* Video Background */}
      {!videoError && (
        <video
          ref={videoRef}
          src={SHOWREEL_CONFIG.videoUrl}
          poster={SHOWREEL_CONFIG.posterUrl}
          autoPlay={!prefersReducedMotion}
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          style={{ objectPosition: SHOWREEL_CONFIG.focalPosition || 'center' }}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover pointer-events-none"
        />
      )}

      {/* Fallback poster image if video fails or is unsupported */}
      {videoError && SHOWREEL_CONFIG.posterUrl && (
        <img
          src={SHOWREEL_CONFIG.posterUrl}
          alt="Studio Showreel"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Center overlay button only if browser blocked playback completely */}
      {hasAutoplayFailed && !isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              unmuteAndPlay();
            }}
            aria-label="Play showreel with sound"
            className="group flex items-center gap-3 rounded-full bg-gradient-to-b from-[#242424] to-[#151515] border border-white/15 border-t-white/30 px-5 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-180 hover:-translate-y-0.5 hover:bg-[#FF6A00] hover:border-[#FF7A1A] hover:text-black active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6A00]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 group-hover:bg-black group-hover:text-[#FF6A00] transition-colors">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
            <span className="text-sm font-extrabold tracking-wide uppercase">
              Play Showreel
            </span>
          </button>
        </div>
      )}

      {/* Subtle bottom dark gradient overlay so controls and explore button stay readable */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/65 to-transparent z-10"
      />

      {/* Bottom Container: Controls & Scroll Indicator */}
      <div className="relative z-20 mx-auto w-full max-w-[1700px] px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left spacer for visual balance on desktop */}
          <div className="hidden sm:block w-36 shrink-0" aria-hidden="true" />

          {/* Center: Scroll down action indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExploreClick();
            }}
            aria-label="Scroll to explore our work"
            className="group inline-flex flex-col items-center gap-1.5 text-white/80 hover:text-white transition-all duration-180 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6A00] rounded-xl px-3 py-1.5"
          >
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase transition-colors group-hover:text-[#FF6A00]">
              Scroll to explore our work
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#222222] to-[#141414] border border-white/10 border-t-white/25 shadow-[0_2px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-180 group-hover:bg-[#FF6A00] group-hover:text-black group-hover:border-[#FF7A1A] group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0 active:translate-y-0">
              <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
            </span>
          </button>

          {/* Right: Frosted Glass Audio Control (No pause button) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-180 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6A00] will-change-transform ${
                isMuted
                  ? 'bg-gradient-to-b from-[#222222] to-[#141414] border border-[#FF6A00]/60 border-t-white/30 text-white shadow-[0_3px_12px_rgba(255,106,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] animate-pulse hover:-translate-y-0.5 hover:bg-[#FF6A00] hover:text-black hover:border-[#FF7A1A] active:translate-y-0'
                  : 'bg-gradient-to-b from-[#222222] to-[#151515] text-[#FF6A00] border border-[#FF6A00]/30 border-t-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:border-[#FF6A00] hover:bg-[#FF6A00]/20 active:translate-y-0'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-[#FF6A00]" />
                  <span>Click to Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
