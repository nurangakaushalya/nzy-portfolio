import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, Trash2, Upload, X } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import type { Category, Project, ProjectStatus, ProjectType } from '../types/portfolio';
import { extractYouTubeId, isValidYouTubeUrl } from '../utils/youtube';
import { sortCategories } from '../utils/portfolioFilters';
import { ThumbnailImage } from './ThumbnailImage';

interface AdminProjectFormProps {
  categories: Category[];
  initialProject: Project | null;
  nextOrder: number;
  onSave: (project: Project) => boolean;
  onCancel: () => void;
}

function readSmallImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose a valid image file (PNG, JPG, WebP).'));
      return;
    }
    if (file.size > BRAND_CONFIG.maxLocalImageBytes) {
      const kb = Math.round(file.size / 1024);
      const maxKb = Math.round(BRAND_CONFIG.maxLocalImageBytes / 1024);
      reject(
        new Error(
          `Image is ${kb} KB, which exceeds the ${maxKb} KB browser-storage limit. Use a smaller file or paste an image URL.`
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

export const AdminProjectForm: React.FC<AdminProjectFormProps> = ({
  categories,
  initialProject,
  nextOrder,
  onSave,
  onCancel,
}) => {
  const orderedCategories = sortCategories(categories);
  const isEditing = initialProject !== null;

  const [title, setTitle] = useState(initialProject?.title ?? '');
  const [type, setType] = useState<ProjectType>(initialProject?.type ?? 'video');
  const [categoryId, setCategoryId] = useState(
    initialProject?.categoryId ?? orderedCategories[0]?.id ?? ''
  );
  const [description, setDescription] = useState(initialProject?.description ?? '');
  const [servicesInput, setServicesInput] = useState(
    initialProject?.services.join(', ') ?? ''
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(initialProject?.thumbnailUrl ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialProject?.youtubeUrl ?? '');
  const [previewUrl, setPreviewUrl] = useState(initialProject?.previewUrl ?? '');
  const [duration, setDuration] = useState(initialProject?.duration ?? '');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProject?.galleryImages ?? []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(
    initialProject?.status ?? 'published'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>(
    initialProject?.aspectRatio ??
      (initialProject?.orientation === 'portrait' || initialProject?.categoryId === 'cat-reels'
        ? '9:16'
        : '16:9')
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const extractedYoutubeId = youtubeUrl.trim() ? extractYouTubeId(youtubeUrl) : null;

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    setUploadError(null);
    try {
      const dataUrl = await readSmallImageFile(file);
      setThumbnailUrl(dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    setUploadError(null);
    try {
      const dataUrl = await readSmallImageFile(file);
      setGalleryImages((prev) => [...prev, dataUrl]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) {
      return;
    }
    setGalleryImages((prev) => [...prev, trimmed]);
    setNewGalleryUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = 'Project title is required.';
    }
    if (!categoryId) {
      nextErrors.categoryId = 'Select a category.';
    }
    if (type === 'video' && youtubeUrl.trim() && !isValidYouTubeUrl(youtubeUrl)) {
      nextErrors.youtubeUrl =
        'Enter a valid YouTube link (watch?v=, youtu.be/, embed/, or shorts/).';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const parsedServices = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectPayload: Project = {
      id: initialProject?.id ?? `proj-${Date.now()}`,
      title: title.trim(),
      type,
      categoryId,
      description: description.trim(),
      services: parsedServices,
      thumbnailUrl: thumbnailUrl.trim(),
      status,
      order: initialProject?.order ?? nextOrder,
      aspectRatio,
      orientation: aspectRatio === '9:16' ? 'portrait' : 'landscape',
      ...(type === 'video'
        ? {
            youtubeUrl: youtubeUrl.trim() || undefined,
            previewUrl: previewUrl.trim() || undefined,
            fullVideoUrl: initialProject?.fullVideoUrl || previewUrl.trim() || undefined,
            duration: duration.trim() || undefined,
            galleryImages: undefined,
          }
        : {
            galleryImages:
              galleryImages.length > 0
                ? galleryImages
                : thumbnailUrl.trim()
                ? [thumbnailUrl.trim()]
                : [],
            youtubeUrl: undefined,
            previewUrl: undefined,
            fullVideoUrl: undefined,
            duration: undefined,
          }),
    };

    onSave(projectPayload);
  };

  return (
    <div className="rounded-xl border border-white/15 bg-[#0D0D0D] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            {isEditing ? `Edit project: ${initialProject.title}` : 'Add new project'}
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Changes save immediately in this browser’s localStorage.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel editing project"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="proj-title" className="block text-sm font-medium text-white">
              Title <span className="text-[#FF6A00]">*</span>
            </label>
            <input
              id="proj-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) {
                  setFormErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              aria-invalid={Boolean(formErrors.title)}
              placeholder="e.g. Chronograph Field — Launch Spot"
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
            />
            {formErrors.title && (
              <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formErrors.title}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proj-type" className="block text-sm font-medium text-white">
                Type
              </label>
              <select
                id="proj-type"
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white focus:border-[#FF6A00] focus:outline-none"
              >
                <option value="video">Video</option>
                <option value="design">Graphic Design</option>
              </select>
            </div>

            <div>
              <label htmlFor="proj-status" className="block text-sm font-medium text-white">
                Status
              </label>
              <select
                id="proj-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white focus:border-[#FF6A00] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="proj-category" className="block text-sm font-medium text-white">
              Category <span className="text-[#FF6A00]">*</span>
            </label>
            <select
              id="proj-category"
              value={categoryId}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategoryId(newCat);
                if (newCat === 'cat-reels') {
                  setAspectRatio('9:16');
                }
              }}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white focus:border-[#FF6A00] focus:outline-none"
            >
              {orderedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proj-aspect" className="block text-sm font-medium text-white">
              Format / Aspect Ratio
            </label>
            <select
              id="proj-aspect"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white focus:border-[#FF6A00] focus:outline-none"
            >
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Vertical Reel</option>
            </select>
          </div>

          <div>
            <label htmlFor="proj-services" className="block text-sm font-medium text-white">
              Services provided
            </label>
            <input
              id="proj-services"
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="Editorial Cut, Color Grading, Sound Design"
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="proj-description" className="block text-sm font-medium text-white">
            Description
          </label>
          <textarea
            id="proj-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concise summary of the brief, edit style, or visual direction..."
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-black p-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
          />
        </div>

        {/* Thumbnail URL + local prototype upload */}
        <div className="rounded-lg border border-white/10 bg-black/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#141414]">
              <ThumbnailImage
                src={thumbnailUrl}
                alt="Thumbnail preview"
                fallbackTitle={title || 'Thumbnail preview'}
                projectType={type}
                eager
              />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <label htmlFor="proj-thumb" className="block text-sm font-medium text-white">
                  Thumbnail URL
                </label>
                <input
                  id="proj-thumb"
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="/src/assets/images/... or https://..."
                  className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#272727] px-3 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Upload small local image (max 500 KB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="sr-only"
                  />
                </label>
                <span className="text-xs text-white/50">
                  Local uploads stay in this browser; permanent shared uploads require production storage.
                </span>
              </div>
            </div>
          </div>

          {uploadError && (
            <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{uploadError}</span>
            </p>
          )}
        </div>

        {/* Video-specific fields */}
        {type === 'video' ? (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-white/10 bg-black/60 p-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="proj-youtube" className="block text-sm font-medium text-white">
                YouTube URL (Unlisted or Public)
              </label>
              <input
                id="proj-youtube"
                type="url"
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  if (formErrors.youtubeUrl) {
                    setFormErrors((prev) => ({ ...prev, youtubeUrl: '' }));
                  }
                }}
                aria-invalid={Boolean(formErrors.youtubeUrl)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
              />
              {formErrors.youtubeUrl ? (
                <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formErrors.youtubeUrl}</span>
                </p>
              ) : extractedYoutubeId ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Valid YouTube ID extracted:{' '}
                    <code className="font-mono">{extractedYoutubeId}</code>
                  </span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="proj-duration" className="block text-sm font-medium text-white">
                Duration
              </label>
              <input
                id="proj-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="01:15"
                className="font-mono mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="proj-preview-mp4" className="block text-sm font-medium text-white">
                Optional MP4 hover preview URL
              </label>
              <input
                id="proj-preview-mp4"
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://.../preview-clip.mp4"
                className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* Graphic Design Gallery Images */
          <div className="rounded-lg border border-white/10 bg-black/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-white">
                  Gallery images ({galleryImages.length})
                </h3>
                <p className="text-xs text-white/55">
                  Add multiple visuals for the Graphic Design gallery lightbox.
                </p>
              </div>
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#272727] px-3 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Upload slide</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                aria-label="Add gallery image URL"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste image URL and click Add..."
                className="h-9 flex-1 rounded-lg border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/40 focus:border-[#FF6A00] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#272727] px-3 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl.slice(0, 32)}-${idx}`}
                    className="group relative aspect-video overflow-hidden rounded-lg border border-white/15 bg-[#141414]"
                  >
                    <ThumbnailImage
                      src={imgUrl}
                      alt={`Gallery slide ${idx + 1}`}
                      fallbackTitle={`Slide ${idx + 1}`}
                      projectType="design"
                      eager
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label={`Remove gallery image ${idx + 1}`}
                      className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#272727]/95 text-[#F1F1F1] hover:bg-[#3F3F3F] hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="depth-btn inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-[#F1F1F1]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="depth-btn-active inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm"
          >
            {isEditing ? 'Save project changes' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  );
};
