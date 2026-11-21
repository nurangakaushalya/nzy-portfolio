import type { Project } from '../types/portfolio';

export type ProjectFormat = 'landscape' | 'portrait';

export interface MixedWorkRow {
  type: 'mixed';
  pattern: 'landscape-first' | 'portrait-first';
  left: Project;
  right: Project;
}

export interface LandscapePairRow {
  type: 'landscape-pair';
  left: Project;
  right: Project;
}

export interface ReelsPairRow {
  type: 'reels-pair';
  left: Project;
  right: Project;
}

export interface SingleProjectRow {
  type: 'single';
  project: Project;
  format: ProjectFormat;
}

export type WorkRow = MixedWorkRow | LandscapePairRow | ReelsPairRow | SingleProjectRow;

export const PORTRAIT_PROJECT_IDS = new Set([
  'proj-night-outerwear-reel',
  'proj-roastery-pour-reel',
  'proj-amber-stage-session',
  'proj-canyon-acoustic-film',
  'proj-obsidian-ribbon-package',
  'proj-harmonic-bars-opener',
  'proj-yt-xYUpfTtWV_c',
  'proj-yt-4qZoG_Ce_j0',
  'proj-yt-fsQzxdZMZJQ',
  'proj-yt-9wdzkHByyHM',
  'proj-yt-UeJONAXGL3o',
  'proj-yt-_UtuPc1tXz4',
]);

/**
 * Returns true if a project is a 9:16 vertical reel / portrait format.
 * Checks explicit metadata first, followed by category ID and title/description hints.
 */
export function isPortraitProject(project: Project): boolean {
  if (PORTRAIT_PROJECT_IDS.has(project.id)) return true;
  if (project.orientation === 'portrait') return true;
  if (project.orientation === 'landscape') return false;
  if (project.aspectRatio === '9:16') return true;
  if (project.aspectRatio === '16:9') return false;

  // Category fallback
  if (project.categoryId === 'cat-reels') return true;

  // Content heuristics fallback
  const title = (project.title || '').toLowerCase();
  const desc = (project.description || '').toLowerCase();
  if (
    title.includes('reel') ||
    title.includes('shorts') ||
    title.includes('9:16') ||
    title.includes('vertical') ||
    desc.includes('9:16') ||
    desc.includes('vertical edit')
  ) {
    return true;
  }

  return false;
}

/**
 * Arranges the given list of filtered projects into rows according to the reference layout:
 * - Mixed pairs alternate: [Landscape, Reel], [Reel, Landscape], etc.
 * - Remaining landscapes are grouped into balanced 2-column pairs.
 * - Remaining reels are grouped into side-by-side portrait pairs.
 * - An unpaired project retains its natural proportions.
 * - Preserves existing project order within each format.
 */
export function buildWorkRows(projects: Project[]): WorkRow[] {
  const landscapes: Project[] = [];
  const portraits: Project[] = [];

  for (const project of projects) {
    if (isPortraitProject(project)) {
      portraits.push(project);
    } else {
      landscapes.push(project);
    }
  }

  const rows: WorkRow[] = [];
  let mixedCount = 0;

  // 1. Alternate mixed pairs while both formats have available projects
  while (landscapes.length > 0 && portraits.length > 0) {
    const isLandscapeFirst = mixedCount % 2 === 0;
    if (isLandscapeFirst) {
      const left = landscapes.shift()!;
      const right = portraits.shift()!;
      rows.push({
        type: 'mixed',
        pattern: 'landscape-first',
        left,
        right,
      });
    } else {
      const left = portraits.shift()!;
      const right = landscapes.shift()!;
      rows.push({
        type: 'mixed',
        pattern: 'portrait-first',
        left,
        right,
      });
    }
    mixedCount++;
  }

  // 2. Remaining landscape projects: group in balanced two-column pairs
  while (landscapes.length >= 2) {
    const left = landscapes.shift()!;
    const right = landscapes.shift()!;
    rows.push({
      type: 'landscape-pair',
      left,
      right,
    });
  }

  if (landscapes.length === 1) {
    rows.push({
      type: 'single',
      project: landscapes.shift()!,
      format: 'landscape',
    });
  }

  // 3. Remaining reels: group side by side at consistent portrait size
  while (portraits.length >= 2) {
    const left = portraits.shift()!;
    const right = portraits.shift()!;
    rows.push({
      type: 'reels-pair',
      left,
      right,
    });
  }

  if (portraits.length === 1) {
    rows.push({
      type: 'single',
      project: portraits.shift()!,
      format: 'portrait',
    });
  }

  return rows;
}
