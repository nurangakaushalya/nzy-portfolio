import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { ThumbnailImage } from './ThumbnailImage';

interface DesignGalleryModalProps {
  project: Project | null;
  categoryName: string;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onDiscussSimilar: (project: Project) => void;
}

export const DesignGalleryModal: React.FC<DesignGalleryModalProps> = ({
  project,
  categoryName,
  returnFocusTo,
  onClose,
  onDiscussSimilar,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isOpen = project !== null;
  useModalFocusTrap(isOpen, dialogRef, returnFocusTo, onClose);

  const images =
    project?.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : project?.thumbnailUrl
      ? [project.thumbnailUrl]
      : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!isOpen || images.length <= 1) {
      return;
    }

    const handleArrowNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleArrowNav);
    return () => window.removeEventListener('keydown', handleArrowNav);
  }, [isOpen, images.length]);

  if (!project) {
    return null;
  }

  const currentSrc = images[activeIndex] ?? project.thumbnailUrl;
  const hasMultiple = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-modal-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl depth-panel shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] focus:outline-none"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {activeIndex + 1} / {Math.max(1, images.length)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close design gallery"
            className="depth-btn inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#F1F1F1]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Gallery Image Stage */}
        <div className="relative aspect-video w-full bg-black">
          <ThumbnailImage
            src={currentSrc}
            alt={`${project.title} — visual ${activeIndex + 1} of ${images.length}`}
            fallbackTitle={project.title}
            projectType="design"
            eager
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
                }
                aria-label="Previous image"
                className="depth-btn absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-[#F1F1F1]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                aria-label="Next image"
                className="depth-btn absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-[#F1F1F1]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail switcher strip */}
        {hasMultiple && (
          <div
            className="flex items-center gap-2.5 overflow-x-auto border-b border-white/10 bg-[#0F0F0F] px-4 py-3 sm:px-6"
            aria-label="Gallery thumbnails"
          >
            {images.map((imgUrl, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`relative aspect-video h-12 shrink-0 overflow-hidden rounded-md border transition-all ${
                    isSelected
                      ? 'border-[#FF6A00] ring-1 ring-[#FF6A00]'
                      : 'border-white/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <ThumbnailImage
                    src={imgUrl}
                    alt={`${project.title} thumbnail ${idx + 1}`}
                    fallbackTitle={`${idx + 1}`}
                    projectType="design"
                    eager
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Details & Enquiry CTA */}
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h2
                id="design-modal-title"
                className="font-display text-xl font-semibold text-white sm:text-2xl"
              >
                {project.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {project.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDiscussSimilar(project);
              }}
              className="depth-btn-active inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm"
            >
              <span>Discuss a similar project</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {project.services.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-medium text-white/50">Services provided</p>
              <p className="mt-1 text-sm text-white/85">
                {project.services.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
