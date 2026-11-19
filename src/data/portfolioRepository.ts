import type { PortfolioData } from '../types/portfolio';
import { createDefaultPortfolioData } from './seedData';

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
      return parsed;
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
