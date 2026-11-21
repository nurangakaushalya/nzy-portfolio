import type { PortfolioData, Project } from '../types/portfolio';
import { createDefaultPortfolioData, TARGET_YOUTUBE_VIDEOS } from './seedData';
import { extractYouTubeId } from '../utils/youtube';

const STORAGE_KEY = 'nzy_portfolio_data_v1';

export interface SaveResult {
  ok: boolean;
  error?: string;
}

/**
 * Data-access layer isolated from UI components so localStorage can be
 * swapped for a CMS or backend API in production without changing views.
 */
export interface PortfolioRepository {
  load(): PortfolioData;
  save(data: PortfolioData): SaveResult;
  reset(): PortfolioData;
}

function isValidPortfolioData(candidate: unknown): candidate is PortfolioData {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const obj = candidate as Partial<PortfolioData>;
  return Array.isArray(obj.categories) && Array.isArray(obj.projects);
}

/**
 * Synchronizes video projects to match the 10 target YouTube videos in their exact mixed order:
 * 1.  Portrait  9:16   https://youtube.com/shorts/xYUpfTtWV_c
 * 2.  Landscape 16:9   https://youtu.be/U4KAEAVKYFE
 * 3.  Portrait  9:16   https://youtube.com/shorts/4qZoG_Ce_j0
 * 4.  Landscape 16:9   https://youtu.be/PZhZyPE8Yso
 * 5.  Portrait  9:16   https://youtube.com/shorts/fsQzxdZMZJQ
 * 6.  Portrait  9:16   https://youtube.com/shorts/9wdzkHByyHM
 * 7.  Landscape 16:9   https://youtu.be/7LdyzIjFS58
 * 8.  Portrait  9:16   https://youtube.com/shorts/UeJONAXGL3o
 * 9.  Landscape 16:9   https://youtu.be/S1v_MS_xVAM
 * 10. Portrait  9:16   https://youtube.com/shorts/_UtuPc1tXz4
 *
 * Matches existing entries by YouTube video ID so running this update twice produces the same 10 cards.
 * Preserves non-video design projects and any existing admin customizations.
 */
export function syncYouTubeVideoProjects(projects: Project[]): Project[] {
  // Retain non-video design projects
  const nonVideoProjects = projects.filter((p) => p.type !== 'video');

  // Index existing projects by their YouTube video ID
  const existingMap = new Map<string, Project>();
  for (const project of projects) {
    if (project.youtubeUrl) {
      const ytId = extractYouTubeId(project.youtubeUrl);
      if (ytId && !existingMap.has(ytId)) {
        existingMap.set(ytId, project);
      }
    }
    if (project.id && project.id.startsWith('proj-yt-')) {
      const candidateId = project.id.slice('proj-yt-'.length);
      if (candidateId && !existingMap.has(candidateId)) {
        existingMap.set(candidateId, project);
      }
    }
  }

  // Construct the 10 synchronized video cards matching the exact target list and mixed order
  const syncedVideoCards: Project[] = TARGET_YOUTUBE_VIDEOS.map((target, index) => {
    const existing = existingMap.get(target.youtubeId);
    if (existing) {
      return {
        ...existing,
        id: existing.id || `proj-yt-${target.youtubeId}`,
        title: existing.title?.trim() ? existing.title : target.title,
        type: 'video' as const,
        categoryId: existing.categoryId || target.categoryId,
        description: existing.description?.trim() ? existing.description : target.description,
        services:
          Array.isArray(existing.services) && existing.services.length > 0
            ? existing.services
            : [...target.services],
        thumbnailUrl: existing.thumbnailUrl || target.thumbnailUrl,
        youtubeUrl: target.youtubeUrl,
        duration: target.duration,
        aspectRatio: target.aspectRatio,
        orientation: target.orientation,
        status: 'published' as const,
        order: target.order !== undefined ? target.order : index,
      };
    }

    return {
      id: `proj-yt-${target.youtubeId}`,
      title: target.title,
      type: 'video' as const,
      categoryId: target.categoryId,
      description: target.description,
      services: [...target.services],
      thumbnailUrl: target.thumbnailUrl,
      youtubeUrl: target.youtubeUrl,
      duration: target.duration,
      aspectRatio: target.aspectRatio,
      orientation: target.orientation,
      status: 'published' as const,
      order: target.order !== undefined ? target.order : index,
    };
  });

  return [...syncedVideoCards, ...nonVideoProjects];
}

export const localPortfolioRepository: PortfolioRepository = {
  load(): PortfolioData {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createDefaultPortfolioData();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = createDefaultPortfolioData();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!isValidPortfolioData(parsed)) {
        return createDefaultPortfolioData();
      }

      // Ensure YouTube video projects are cleanly matched and synced
      const syncedProjects = syncYouTubeVideoProjects(parsed.projects);
      const syncedData: PortfolioData = {
        categories: parsed.categories,
        projects: syncedProjects,
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
      } catch {
        // Ignore quota warning on update
      }

      return syncedData;
    } catch {
      return createDefaultPortfolioData();
    }
  },

  save(data: PortfolioData): SaveResult {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: true };
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22)
          ? 'Browser storage is full. Use smaller uploaded images or paste external image URLs instead.'
          : 'Unable to save changes to browser storage.';
      return { ok: false, error: message };
    }
  },

  reset(): PortfolioData {
    const seed = createDefaultPortfolioData();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      } catch {
        // Ignore storage write error on reset fallback
      }
    }
    return seed;
  },
};
