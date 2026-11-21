import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play } from 'lucide-react';
import type { Category, Project } from '../types/portfolio';
import { packStaggeredGallery, type PackedCard } from '../utils/galleryPacking';
import { extractYouTubeId, getYouTubePreviewUrl } from '../utils/youtube';
import { ThumbnailImage } from './ThumbnailImage';

interface RollerGalleryProps {
  projects: Project[];
  categories: Category[];
  isOtherVideoPlaying?: boolean;
  onOpenProject: (project: Project, triggerEl: HTMLElement | null) => void;
}

interface StaggeredCardProps {
  card: PackedCard;
  isMobile: boolean;
  isPreviewActive: boolean;
  onRequestPreview: (id: string | null) => void;
  onOpenProject: (project: Project, triggerEl: HTMLElement | null) => void;
}

const StaggeredCard: React.FC<StaggeredCardProps> = ({
  card,
  isMobile,
  isPreviewActive,
  onRequestPreview,
  onOpenProject,
}) => {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { project, isPortrait, w, mediaH } = card;
  const youtubeId = project.youtubeUrl ? extractYouTubeId(project.youtubeUrl) : null;
  const previewSrc = project.previewUrl || project.fullVideoUrl;
  const hasPreview = Boolean(youtubeId || previewSrc);

  const posterUrl =
    project.thumbnailUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '');

  // For native mp4 preview clips if present
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPreviewActive && previewSrc && !youtubeId) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isPreviewActive, previewSrc, youtubeId]);

  const handlePointerEnter = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      onRequestPreview(project.id);
    }
  };

  const handlePointerLeave = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      onRequestPreview(null);
    }
  };

  const handleCardClick = () => {
    if (isMobile && !isPreviewActive) {
      onRequestPreview(project.id);
      return;
    }
    onOpenProject(project, mediaRef.current);
  };

  const handleMobileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestPreview(isPreviewActive ? null : project.id);
  };

  const isPreviewPlaying = isPreviewActive && (youtubeId ? true : isPlaying);

  return (
    <div
      ref={mediaRef}
      tabIndex={0}
      role="button"
      aria-label={project.title}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenProject(project, mediaRef.current);
        }
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      data-playable-thumbnail="true"
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/12 bg-[#0C0C0C] depth-card transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] select-none w-full h-full ${
        isPreviewPlaying
          ? 'border-[#FF6A00]/50 shadow-[0_12px_36px_rgba(255,106,0,0.25)]'
          : 'hover:border-white/25 hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
      }`}
      style={{
        width: `${w}px`,
        height: `${mediaH}px`,
      }}
    >
      {/* Poster image (always loaded first) */}
      <ThumbnailImage
        src={posterUrl}
        alt={`${project.title} cover`}
        fallbackTitle={project.title}
        projectType={project.type}
        className="h-full w-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-102"
      />

      {/* Embedded YouTube Player on interaction (muted, continuous preview loop) */}
      {isPreviewActive && youtubeId && (
        <iframe
          src={getYouTubePreviewUrl(youtubeId)}
          title={project.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover border-0 z-10"
        />
      )}

      {/* Native video preview fallback */}
      {isPreviewActive && !youtubeId && previewSrc && (
        <video
          ref={videoRef}
          src={previewSrc}
          muted
          playsInline
          loop
          preload="none"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 z-10 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Top-Right Badges */}
      <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
        {isPortrait && (
          <span className="font-mono text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white/95 bg-black/80 px-2 py-0.5 rounded border border-white/15 shadow-sm backdrop-blur-sm">
            9:16
          </span>
        )}
        {project.duration && (
          <span className="font-mono tabular-nums text-[9px] sm:text-[11px] font-semibold text-white/90 bg-black/80 px-2 py-0.5 rounded border border-white/15 shadow-sm backdrop-blur-sm">
            {project.duration}
          </span>
        )}
      </div>

      {/* Mobile Tap-to-Play Preview Control */}
      {hasPreview && isMobile && (
        <button
          type="button"
          data-player-control="true"
          aria-label={
            isPreviewActive
              ? `Pause preview for ${project.title}`
              : `Play preview for ${project.title}`
          }
          onClick={handleMobileToggle}
          className="sm:hidden absolute bottom-2 left-2 z-30 inline-flex items-center gap-1.5 rounded-lg bg-black/90 text-white border border-white/20 px-2.5 py-1.5 shadow-md active:scale-95 text-[11px] font-semibold pointer-events-auto"
        >
          <Play
            className={`h-3 w-3 ${isPreviewActive ? 'text-[#FF6A00] fill-[#FF6A00]' : 'fill-current'}`}
          />
          <span>{isPreviewActive ? 'Pause' : 'Play preview'}</span>
        </button>
      )}
    </div>
  );
};

export const RollerGallery: React.FC<RollerGalleryProps> = ({
  projects,
  categories,
  isOtherVideoPlaying = false,
  onOpenProject,
}) => {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1280;
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const drumContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter video projects in published order
  const videoProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'published' && p.type === 'video')
      .sort((a, b) => a.order - b.order);
  }, [projects]);

  // Pack cards into tightly packed, staggered arrangement with natural proportions
  const packedLayout = useMemo(() => {
    return packStaggeredGallery(videoProjects, containerWidth);
  }, [videoProjects, containerWidth]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Check prefers-reduced-motion media query and window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mqMotion.matches);

    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mqMotion.addEventListener('change', onMotionChange);

    const updateDimensions = () => {
      if (sectionRef.current) {
        setContainerWidth(sectionRef.current.clientWidth || window.innerWidth);
      } else {
        setContainerWidth(window.innerWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    return () => {
      mqMotion.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Stop active preview when full project modal opens
  useEffect(() => {
    if (isOtherVideoPlaying) {
      setActivePreviewId(null);
    }
  }, [isOtherVideoPlaying]);

  const isMobile = containerWidth < 768;
  const cylinderRadius = isMobile ? 760 : 920; // Shared cylinder radius in pixels
  const cardCount = packedLayout.cards.length;

  const updateDrumMotion = useCallback(() => {
    if (typeof window === 'undefined') return;
    const section = sectionRef.current;
    if (!section || cardCount === 0) return;

    if (prefersReducedMotion) return;

    const headerOffset =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;

    const rect = section.getBoundingClientRect();
    const scrollDist = headerOffset - rect.top;

    // Scroll mapping: progress goes from 0 to 1 as visitor scrolls through the section
    const scrollTravel = Math.max(800, (packedLayout.maxY - packedLayout.minY) * (isMobile ? 1.4 : 1.6));
    const progress = Math.max(0, Math.min(1, scrollDist / scrollTravel));

    // Current continuous vertical scroll along the unwrapped cylinder surface
    const currentYScroll = packedLayout.minY + progress * (packedLayout.maxY - packedLayout.minY);

    for (let i = 0; i < cardCount; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;

      const card = packedLayout.cards[i];
      if (!card) continue;

      // Vertical distance of this card from the front center of the drum
      const deltaY = card.centerY - currentYScroll;

      // Angle of this card in radians around the cylinder:
      // theta = 0 at front center, positive below center (upcoming), negative above center (earlier)
      const theta = deltaY / cylinderRadius;

      // Hide cards when they pass behind the visible face of the drum (|theta| >= pi/2)
      if (Math.abs(theta) >= Math.PI / 2) {
        cardEl.style.visibility = 'hidden';
        cardEl.style.pointerEvents = 'none';
        continue;
      }

      cardEl.style.visibility = 'visible';
      cardEl.style.pointerEvents = 'auto';

      // Cylindrical geometry formulas:
      // y = R * sin(theta)
      // z = R * (cos(theta) - 1)
      // transform = translate3d(xRel, y, z) rotateX(-theta)
      const y3D = cylinderRadius * Math.sin(theta);
      const z3D = cylinderRadius * (Math.cos(theta) - 1);
      const deg = (theta * 180) / Math.PI;

      // Horizontal position relative to drum center
      const xRel = card.centerX - packedLayout.contentWidth / 2;

      // Shading: center is sharp and fully bright; outer cards darken slightly as they curve away
      const curvature = Math.abs(theta) / (Math.PI / 2);
      const brightness = Math.max(0.60, 1.0 - curvature * 0.40);
      const opacity = Math.max(0.70, 1.0 - curvature * 0.30);

      cardEl.style.transform = `translate3d(${xRel.toFixed(2)}px, ${y3D.toFixed(2)}px, ${z3D.toFixed(2)}px) rotateX(${(-deg).toFixed(2)}deg)`;
      cardEl.style.filter = `brightness(${brightness.toFixed(3)})`;
      cardEl.style.opacity = opacity.toFixed(3);
    }
  }, [cardCount, cylinderRadius, isMobile, packedLayout, prefersReducedMotion]);

  // Synchronize with scroll and Lenis smoothly via RAF
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion) return;

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateDrumMotion();
      });
    };

    updateDrumMotion();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    const lenis = (
      window as unknown as {
        __lenis?: {
          on: (event: string, cb: () => void) => void;
          off: (event: string, cb: () => void) => void;
        };
      }
    ).__lenis;

    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', scheduleUpdate);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', scheduleUpdate);
      }
    };
  }, [prefersReducedMotion, updateDrumMotion]);

  // For reduced motion: provide a static packed layout with zero 3D rotation
  if (prefersReducedMotion) {
    return (
      <section
        id="portfolio-section"
        aria-label="Selected Video Work Gallery"
        className="relative w-full py-16 px-4 max-w-7xl mx-auto scroll-mt-[var(--header-height,4rem)]"
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${packedLayout.contentWidth}px`,
            maxWidth: '100%',
            height: `${packedLayout.totalHeight}px`,
          }}
        >
          {packedLayout.cards.map((card) => (
            <div
              key={`static-card-${card.project.id}`}
              className="absolute"
              style={{
                left: `${card.x}px`,
                top: `${card.y}px`,
                width: `${card.w}px`,
                height: `${card.h}px`,
              }}
            >
              <StaggeredCard
                card={card}
                isMobile={isMobile}
                isPreviewActive={activePreviewId === card.project.id}
                onRequestPreview={setActivePreviewId}
                onOpenProject={onOpenProject}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Total scroll distance through the drum:
  // Travel distance through the cylinder plus dwell distance ensuring the final reel stays centered
  // comfortably before the page smoothly transitions into the Services section.
  const scrollTravel = Math.max(800, (packedLayout.maxY - packedLayout.minY) * (isMobile ? 1.4 : 1.6));
  const dwellDistance = 240;
  const totalSectionHeight = `calc(100vh + ${Math.round(scrollTravel + dwellDistance)}px)`;

  return (
    <section
      ref={sectionRef}
      id="portfolio-section"
      aria-label="Rotating Horizontal Drum Video Gallery"
      className="relative w-full overflow-visible scroll-mt-[var(--header-height,4rem)]"
      style={{
        height: totalSectionHeight,
      }}
    >
      {/* 
        Sticky Viewport Stage:
        - Pins at the top of the viewport
        - Perspective origin placed at the center of the roller (50% 50%)
        - Preserves 3D on the inner cylinder
      */}
      <div
        className="sticky top-[var(--header-height,4rem)] w-full h-[calc(100vh-var(--header-height,4rem))] overflow-hidden flex items-center justify-center select-none"
        style={{
          perspective: isMobile ? '1000px' : '1400px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Horizontal Drum Rotating Container */}
        <div
          ref={drumContainerRef}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {packedLayout.cards.map((card, index) => (
            <div
              key={`drum-card-${card.project.id}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="absolute flex items-center justify-center will-change-transform"
              style={{
                left: '50%',
                top: '50%',
                width: `${card.w}px`,
                height: `${card.h}px`,
                marginLeft: `${-card.w / 2}px`,
                marginTop: `${-card.h / 2}px`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              <StaggeredCard
                card={card}
                isMobile={isMobile}
                isPreviewActive={activePreviewId === card.project.id}
                onRequestPreview={setActivePreviewId}
                onOpenProject={onOpenProject}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
