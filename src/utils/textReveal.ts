export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const MUTED_GRAY: RGB = { r: 90, g: 90, b: 90 };
export const WHITE: RGB = { r: 255, g: 255, b: 255 };
export const ORANGE: RGB = { r: 255, g: 106, b: 0 };

/**
 * Linearly interpolates between start and end RGB color tuples by factor [0, 1]
 * and formats the result as a standard `rgb(r, g, b)` CSS color string.
 */
export function interpolateColor(start: RGB, end: RGB, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
  const r = Math.round(start.r + (end.r - start.r) * f);
  const g = Math.round(start.g + (end.g - start.g) * f);
  const b = Math.round(start.b + (end.b - start.b) * f);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Maps a block's overall scroll progress [0, 1] to an individual word's progress [0, 1]
 * in reading order across total words.
 */
export function getWordFactor(progress: number, index: number, total: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1.0) return 1;
  if (total <= 1) return progress;

  // Active transition span per word
  const wordSpan = Math.min(0.32, 0.75 / total + 0.12);
  const step = (1.0 - wordSpan) / (total - 1);
  const wordStart = index * step;
  const wordEnd = wordStart + wordSpan;

  if (progress <= wordStart) return 0;
  if (progress >= wordEnd) return 1;
  return (progress - wordStart) / (wordEnd - wordStart);
}

/**
 * Computes block progress based on top distance from viewport top:
 * - Starts when top reaches startRatio * vh (e.g. 0.75 * vh, putting the first visible change in the lower part of the screen)
 * - Completes when top travels upward by rangeRatio * vh (e.g. 0.30 * vh)
 */
export function calculateBlockProgress(
  top: number,
  vh: number,
  startRatio = 0.75,
  rangeRatio = 0.30
): number {
  const startY = startRatio * vh;
  const travelRange = rangeRatio * vh;
  if (travelRange <= 0) return top <= startY ? 1 : 0;
  if (top >= startY) return 0;
  if (top <= startY - travelRange) return 1;
  return (startY - top) / travelRange;
}
