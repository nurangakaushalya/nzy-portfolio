import React, { useEffect, useRef, useState } from 'react';
import { Images, Play } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { isPortraitProject, type ProjectFormat } from '../utils/projectOrientation';
import { ThumbnailImage } from './ThumbnailImage';

interface ProjectCardProps {
  project: Project;
  categoryName: string;
  isPreviewActive: boolean;
  onRequestPreview: (projectId: string | null) => void;
  onSelect: (project: Project, triggerEl: HTMLElement | null) => void;
  format?: ProjectFormat;
  isMobileLayout?: boolean;
  eagerImage?: boolean;
}

function canAutoPreview(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  return !prefersReducedMotion && Boolean(supportsHover);
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  categoryName,
  isPreviewActive,
  onRequestPreview,
  onSelect,
  format,
  isMobileLayout = false,
  eagerImage = false,
}) => {
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Derive format from prop, metadata, category, or natural image dimensions
  const [derivedFormat, setDerivedFormat] = useState<ProjectFormat>(() => {
    return format ?? (isPortraitProject(project) ? 'portrait' : 'landscape');
  });

  useEffect(() => {
    if (format) {
      setDerivedFormat(format);
      return;
    }
    if (project.orientation || project.aspectRatio || project.categoryId === 'cat-reels') {
      setDerivedFormat(isPortraitProject(project) ? 'portrait' : 'landscape');
      return;
    }

    if (!project.thumbnailUrl) return;

    // Detect natural dimensions as dynamic fallback for custom uploads
    const img = new Image();
    img.src = project.thumbnailUrl;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setDerivedFormat(img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape');
      }
    };
  }, [project, format]);

  const isVideo = project.type === 'video';
  const previewSrc = project.previewUrl || project.fullVideoUrl;
  const hasPreviewClip = isVideo && Boolean(previewSrc) && !previewFailed;
  const galleryCount = project.galleryImages?.length ?? 0;

  useEffect(() => {
    setPreviewFailed(false);
    setPreviewPlaying(false);
  }, [previewSrc]);

  useEffect(() => {
    if (!isPreviewActive) {
      setPreviewPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return;
    }

    if (videoRef.current && hasPreviewClip) {
      const playPromise = videoRef.current.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            setPreviewPlaying(true);
          })
          .catch(() => {
            setPreviewPlaying(false);
            onRequestPreview(null);
          });
      }
    }
  }, [isPreviewActive, hasPreviewClip, onRequestPreview]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !hasPreviewClip || !canAutoPreview()) {
      return;
    }
    onRequestPreview(project.id);
  };

  const handlePointerLeave = () => {
    if (isPreviewActive) {
      onRequestPreview(null);
    }
  };

  const handleFocus = () => {
    if (hasPreviewClip && canAutoPreview()) {
      onRequestPreview(project.id);
    }
  };

  const handleBlur = () => {
    if (isPreviewActive) {
      onRequestPreview(null);
    }
  };

  const handleToggleMobilePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewActive) {
      onRequestPreview(null);
    } else {
      onRequestPreview(project.id);
    }
  };

  const isPortrait = derivedFormat === 'portrait';

  return (
    <article
      className={`group relative flex flex-col w-full ${
        isPortrait && isMobileLayout ? 'max-w-[290px] sm:max-w-[330px] mx-auto' : ''
      }`}
    >
      {/* 
        Media Stage:
        - 16:9 for landscape edits
        - 9:16 for vertical reels
        Dimensions are strictly reserved via aspect ratio so the page stays completely still before media loads.
      */}
      <div
        ref={mediaContainerRef}
        tabIndex={0}
        role="button"
        aria-label={`View ${project.title} (${categoryName})`}
        onClick={() => onSelect(project, mediaContainerRef.current)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(project, mediaContainerRef.current);
          }
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-playable-thumbnail={isVideo ? 'true' : undefined}
        className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C0C] depth-card transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]'
        } ${
          isPreviewActive && previewPlaying
            ? 'border-[#FF6A00]/40 shadow-[0_12px_40px_rgba(255,106,0,0.2)]'
            : 'hover:border-white/20 hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* Cover Image: Complete composition preserved */}
        <ThumbnailImage
          src={project.thumbnailUrl}
          alt={`${project.title} — ${categoryName} cover`}
          fallbackTitle={project.title}
          projectType={project.type}
          eager={eagerImage}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-105"
        />

        {/* Inline On-Demand Muted Video Preview */}
        {hasPreviewClip && (
          <video
            ref={videoRef}
            src={previewSrc}
            muted
            playsInline
            loop
            preload="none"
            aria-hidden="true"
            onPlaying={() => setPreviewPlaying(true)}
            onError={() => {
              setPreviewFailed(true);
              setPreviewPlaying(false);
              onRequestPreview(null);
            }}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isPreviewActive && previewPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Bottom Scrim for Badge Readability */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* Top-Right Badge (Reel 9:16 Pill or Design indicator) */}
        {isPortrait ? (
          <span className="font-mono text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white/90 bg-black/80 px-2 py-0.5 rounded-md border border-white/15 absolute top-3 right-3 shadow-md backdrop-blur-sm">
            9:16 Reel
          </span>
        ) : !isVideo ? (
          <span className="font-mono tabular-nums absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white border border-white/15 shadow-md">
            <Images className="h-3 w-3 text-[#FF6A00]" aria-hidden="true" />
            <span>{Math.max(1, galleryCount)}</span>
          </span>
        ) : null}

        {/* Touchscreen Fixed Play Badge (Shown only on coarse/touch pointers) */}
        {isVideo && (
          <span
            aria-hidden="true"
            className="touch-play-badge absolute bottom-3.5 left-3.5 z-10 h-8 w-8 items-center justify-center rounded-xl bg-black/85 text-[#FF6A00] border border-white/15 shadow-md backdrop-blur-sm pointer-events-none"
          >
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          </span>
        )}

        {/* Mobile Visible Tap-to-Play Control */}
        {isVideo && hasPreviewClip && (
          <button
            type="button"
            aria-label={
              previewPlaying
                ? `Pause preview for ${project.title}`
                : `Play preview for ${project.title}`
            }
            onClick={handleToggleMobilePreview}
            className="lg:hidden absolute bottom-3.5 left-13 z-20 inline-flex items-center gap-1.5 rounded-xl bg-black/90 text-white border border-white/20 px-3 py-1.5 shadow-lg active:scale-95 transition-all text-xs font-semibold"
          >
            <Play
              className={`h-3.5 w-3.5 ${previewPlaying ? 'text-[#FF6A00]' : 'fill-current'}`}
            />
            <span>{previewPlaying ? 'Pause' : 'Preview'}</span>
          </button>
        )}

        {/* Duration Badge */}
        {isVideo && project.duration && (
          <span className="font-mono tabular-nums absolute bottom-3.5 right-3.5 rounded-md bg-black/85 px-2 py-0.5 text-xs font-medium text-white border border-white/15 shadow-md">
            {project.duration}
          </span>
        )}
      </div>

      {/* 
        Project Title & Existing Metadata Directly Below Preview
        Separate interactive link so mobile taps reliably distinguish between video preview and full project modal.
      */}
      <div className="mt-3.5 px-0.5 flex flex-col">
        <button
          type="button"
          onClick={() => onSelect(project, mediaContainerRef.current)}
          className="text-left group/title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] rounded-lg p-0.5"
        >
          <h2 className="font-display text-base sm:text-lg lg:text-[19px] font-bold text-white transition-colors duration-180 group-hover/title:text-[#FF6A00] line-clamp-2">
            {project.title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/60">
            {categoryName}
            {project.services && project.services.length > 0 && (
              <span className="text-white/40"> · {project.services.slice(0, 2).join(', ')}</span>
            )}
          </p>
        </button>
      </div>
    </article>
  );
};
