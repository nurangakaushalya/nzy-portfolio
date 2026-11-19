import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowUpRight, X } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { ThumbnailImage } from './ThumbnailImage';

interface VideoProjectModalProps {
  project: Project | null;
  categoryName: string;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onDiscussSimilar: (project: Project) => void;
}

export const VideoProjectModal: React.FC<VideoProjectModalProps> = ({
  project,
  categoryName,
  returnFocusTo,
  onClose,
  onDiscussSimilar,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [preferDirectFallback, setPreferDirectFallback] = useState(false);
  const [mp4Error, setMp4Error] = useState(false);
  const [mp4Loading, setMp4Loading] = useState(true);

  const isOpen = project !== null;
  useModalFocusTrap(isOpen, dialogRef, returnFocusTo, onClose);

  useEffect(() => {
    setPreferDirectFallback(false);
    setMp4Error(false);
    setMp4Loading(true);

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [project?.id]);

  if (!project) {
    return null;
  }

  const youtubeId = project.youtubeUrl ? extractYouTubeId(project.youtubeUrl) : null;
  const directSource = project.fullVideoUrl || project.previewUrl || '';
  const showYouTube = Boolean(youtubeId) && !preferDirectFallback;

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl depth-panel shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] focus:outline-none"
      >
        {/* Top bar inside modal */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{categoryName}</span>
            {project.duration && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{project.duration}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close video player"
            className="depth-btn inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#F1F1F1]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Full 16:9 Player Stage */}
        <div className="relative aspect-video w-full bg-black">
          {showYouTube && youtubeId ? (
            <iframe
              key={youtubeId}
              src={getYouTubeEmbedUrl(youtubeId, true)}
              title={`${project.title} video player`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : directSource && !mp4Error ? (
            <>
              {mp4Loading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-xs text-white/70">
                  Loading video...
                </div>
              )}
              <video
                ref={videoRef}
                src={directSource}
                poster={project.thumbnailUrl}
                controls
                autoPlay
                playsInline
                onCanPlay={() => setMp4Loading(false)}
                onError={() => {
                  setMp4Loading(false);
                  setMp4Error(true);
                }}
                className="h-full w-full bg-black object-contain"
              />
            </>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-[#090909]">
              <ThumbnailImage
                src={project.thumbnailUrl}
                alt={project.title}
                fallbackTitle={project.title}
                projectType="video"
                eager
                className="opacity-35"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 p-6 text-center">
                <AlertCircle className="mb-2 h-7 w-7 text-[#FF6A00]" aria-hidden="true" />
                <p className="font-display text-base font-medium text-white">
                  Video stream unavailable
                </p>
                <p className="mt-1 max-w-md text-xs text-white/65">
                  This demonstration video source could not be loaded in your current browser or network environment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Optional switch between YouTube embed and direct sample MP4 if both exist */}
        {youtubeId && directSource && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0F0F0F] px-4 py-2 text-xs text-white/60 sm:px-6">
            <span>
              {showYouTube
                ? 'Playing YouTube embed (unlisted/public embed format).'
                : 'Playing direct prototype sample MP4 clip.'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMp4Error(false);
                setPreferDirectFallback((prev) => !prev);
              }}
              className="rounded-lg bg-[#272727] px-3 py-1.5 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
            >
              {showYouTube ? 'Switch to sample MP4 clip' : 'Switch to YouTube embed'}
            </button>
          </div>
        )}

        {/* Project Details */}
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h2
                id="video-modal-title"
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
                handleClose();
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
