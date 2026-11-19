import React, { useEffect, useRef, useState } from 'react';
import { Images, Play } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { ThumbnailImage } from './ThumbnailImage';

interface ProjectCardProps {
  project: Project;
  categoryName: string;
  isPreviewActive: boolean;
  onRequestPreview: (projectId: string | null) => void;
  onSelect: (project: Project, triggerEl: HTMLElement | null) => void;
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
  eagerImage = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const isVideo = project.type === 'video';
  const hasPreviewClip = isVideo && Boolean(project.previewUrl) && !previewFailed;
  const galleryCount = project.galleryImages?.length ?? 0;

  useEffect(() => {
    setPreviewFailed(false);
    setPreviewPlaying(false);
  }, [project.previewUrl]);

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
            // Autoplay blocked or failed: quietly retain thumbnail
            setPreviewPlaying(false);
            onRequestPreview(null);
          });
      }
    }
  }, [isPreviewActive, hasPreviewClip, onRequestPreview]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || !hasPreviewClip || !canAutoPreview()) {
      return;
    }
    // Play immediately without delay on hover
    onRequestPreview(project.id);
  };

  const handlePointerLeave = () => {
    if (isPreviewActive) {
      onRequestPreview(null);
    }
  };

  return (
    <article className="group relative flex flex-col hover:z-20">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onSelect(project, buttonRef.current)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        aria-label={`Open ${project.title} (${categoryName})`}
        className="depth-card flex w-full flex-col text-left rounded-2xl p-2 sm:p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {/* Fixed 16:9 Thumbnail / Preview Stage — Recessed into the card */}
        <div
          className={`project-thumbnail-stretch relative aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-[#0C0C0C] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] ${
            isPreviewActive && previewPlaying ? 'preview-active' : ''
          }`}
        >
          <ThumbnailImage
            src={project.thumbnailUrl}
            alt={`${project.title} — ${categoryName} thumbnail`}
            fallbackTitle={project.title}
            projectType={project.type}
            eager={eagerImage}
          />

          {/* Preloaded inline preview video for immediate playback */}
          {hasPreviewClip && (
            <video
              ref={videoRef}
              src={project.previewUrl}
              muted
              playsInline
              loop
              preload="metadata"
              aria-hidden="true"
              onPlaying={() => setPreviewPlaying(true)}
              onError={() => {
                setPreviewFailed(true);
                setPreviewPlaying(false);
                onRequestPreview(null);
              }}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${
                isPreviewActive && previewPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Subtle gradient scrim at bottom edge for badge readability */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent"
          />

          {/* Visible play affordance for video cards */}
          {isVideo && (
            <span
              aria-hidden="true"
              className="absolute bottom-2.5 left-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/80 text-[#F1F1F1] border border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors duration-180 group-hover:bg-[#FF6A00] group-hover:text-black group-hover:border-[#FF7A1A]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          )}

          {/* Duration badge (video) or Gallery indicator (graphic design) */}
          {isVideo && project.duration ? (
            <span className="font-mono tabular-nums absolute bottom-2.5 right-2.5 rounded bg-black/85 px-1.5 py-0.5 text-xs font-medium text-white border border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-colors duration-180 group-hover:bg-black">
              {project.duration}
            </span>
          ) : !isVideo ? (
            <span className="font-mono tabular-nums absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 text-xs font-medium text-white border border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <Images className="h-3 w-3 text-[#FF6A00]" aria-hidden="true" />
              <span>{Math.max(1, galleryCount)}</span>
            </span>
          ) : null}
        </div>

        {/* Integrated Title & Category Metadata — Part of the unified 3D card */}
        <div className="pt-2.5 pb-1 px-1">
          <h2 className="font-display text-[15px] font-medium leading-snug text-white line-clamp-2 transition-colors duration-180 group-hover:text-[#FF6A00]">
            {project.title}
          </h2>
          <p className="mt-1 text-[13px] text-white/60">
            {categoryName}
          </p>
        </div>
      </button>
    </article>
  );
};
