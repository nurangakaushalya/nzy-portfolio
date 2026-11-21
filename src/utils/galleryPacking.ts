import type { Project } from '../types/portfolio';
import { isPortraitProject } from './projectOrientation';

/**
 * 32-bit FNV-1a hash function to produce a stable, deterministic seed from a string.
 */
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface PackedCard {
  project: Project;
  isPortrait: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  mediaH: number;
  colIdx: number;
  centerX: number;
  centerY: number;
}

export interface PackedGalleryLayout {
  contentWidth: number;
  totalHeight: number;
  cards: PackedCard[];
  minY: number;
  maxY: number;
  numCols: number;
}

/**
 * Packs 10 video projects (6 portrait 9:16 short videos and 4 landscape 16:9 videos)
 * into a continuous cylindrical roller layout:
 *
 * Desktop:
 * - Group 1 (Top): Two landscape videos stacked beside a pair of tall reels
 * - Group 2 (Middle): Varied arrangement down (pair of tall reels on left, stacked landscapes on right)
 * - Group 3 (Bottom): Remaining reels distributed across the layout
 * - Preserves natural aspect ratios, small consistent gaps, and stable staggered coordinates.
 *
 * Mobile:
 * - Pairs portrait reels side-by-side and lets landscape videos span the full available width.
 */
export function packStaggeredGallery(
  projects: Project[],
  containerWidth: number
): PackedGalleryLayout {
  const isMobile = containerWidth < 768;
  const isTablet = containerWidth >= 768 && containerWidth < 1024;

  const gapX = isMobile ? 14 : isTablet ? 18 : 24;
  const gapY = isMobile ? 20 : isTablet ? 22 : 26;
  const textHeight = 0;

  const contentWidth = Math.max(300, Math.min(containerWidth - (isMobile ? 24 : 48), 1340));

  // Separate video projects by orientation
  const videoProjects = projects.filter((p) => p.status === 'published' && p.type === 'video');
  const portraits: Project[] = [];
  const landscapes: Project[] = [];

  for (const project of videoProjects) {
    if (isPortraitProject(project)) {
      portraits.push(project);
    } else {
      landscapes.push(project);
    }
  }

  const cards: PackedCard[] = [];

  if (isMobile) {
    // ----------------------------------------------------
    // MOBILE LAYOUT:
    // Pair portrait reels side by side and let landscape videos span the available width.
    // ----------------------------------------------------
    const wReel = Math.floor((contentWidth - gapX) / 2);
    const reelMediaH = Math.round(wReel * (16 / 9));
    const reelH = reelMediaH + textHeight;

    const wLandscape = contentWidth;
    const landMediaH = Math.round(wLandscape / (16 / 9));
    const landH = landMediaH + textHeight;

    let currentY = 0;
    let pIdx = 0;
    let lIdx = 0;

    // Pattern on mobile:
    // 1. Pair 1 (P0, P1) side-by-side
    // 2. Landscapes L0, L1 (each spanning full width)
    // 3. Pair 2 (P2, P3) side-by-side
    // 4. Landscapes L2, L3 (each spanning full width)
    // 5. Pair 3 (P4, P5) side-by-side — final reel P5 is at the bottom reaching maxY
    const pushReelPair = (p1: Project, p2?: Project) => {
      cards.push({
        project: p1,
        isPortrait: true,
        x: 0,
        y: currentY,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 0,
        centerX: wReel / 2,
        centerY: currentY + reelH / 2,
      });

      if (p2) {
        // Stagger right reel subtly so final reel P5 has the maximal centerY
        const staggerY = pIdx >= portraits.length ? 12 : 0;
        cards.push({
          project: p2,
          isPortrait: true,
          x: wReel + gapX,
          y: currentY + staggerY,
          w: wReel,
          h: reelH,
          mediaH: reelMediaH,
          colIdx: 1,
          centerX: wReel + gapX + wReel / 2,
          centerY: currentY + staggerY + reelH / 2,
        });
        currentY += staggerY;
      }
      currentY += reelH + gapY;
    };

    const pushLandscape = (land: Project) => {
      cards.push({
        project: land,
        isPortrait: false,
        x: 0,
        y: currentY,
        w: wLandscape,
        h: landH,
        mediaH: landMediaH,
        colIdx: 0,
        centerX: wLandscape / 2,
        centerY: currentY + landH / 2,
      });
      currentY += landH + gapY;
    };

    // Row 1: Pair 1 (P0, P1)
    if (pIdx < portraits.length) {
      const p1 = portraits[pIdx++];
      const p2 = pIdx < portraits.length ? portraits[pIdx++] : undefined;
      pushReelPair(p1, p2);
    }

    // Rows 2 & 3: Landscape L0, L1
    if (lIdx < landscapes.length) pushLandscape(landscapes[lIdx++]);
    if (lIdx < landscapes.length) pushLandscape(landscapes[lIdx++]);

    // Row 4: Pair 2 (P2, P3)
    if (pIdx < portraits.length) {
      const p1 = portraits[pIdx++];
      const p2 = pIdx < portraits.length ? portraits[pIdx++] : undefined;
      pushReelPair(p1, p2);
    }

    // Rows 5 & 6: Landscape L2, L3
    if (lIdx < landscapes.length) pushLandscape(landscapes[lIdx++]);
    if (lIdx < landscapes.length) pushLandscape(landscapes[lIdx++]);

    // Row 7: Pair 3 (P4, P5) — contains final reel P5
    if (pIdx < portraits.length) {
      const p1 = portraits[pIdx++];
      const p2 = pIdx < portraits.length ? portraits[pIdx++] : undefined;
      pushReelPair(p1, p2);
    }

    // Handle any extra items if portfolio data is extended
    while (pIdx < portraits.length || lIdx < landscapes.length) {
      if (pIdx < portraits.length) {
        const p1 = portraits[pIdx++];
        const p2 = pIdx < portraits.length ? portraits[pIdx++] : undefined;
        pushReelPair(p1, p2);
      }
      if (lIdx < landscapes.length) {
        pushLandscape(landscapes[lIdx++]);
      }
    }
  } else {
    // ----------------------------------------------------
    // DESKTOP LAYOUT (3-column composition):
    // 1. Group 1 (Top): Two landscape videos stacked beside a pair of tall reels
    // 2. Group 2 (Middle): Varied arrangement down (pair of tall reels on left, stacked landscapes on right)
    // 3. Group 3 (Bottom): Remaining reels distributed across the layout
    // ----------------------------------------------------
    const totalColsW = contentWidth - 2 * gapX;
    // Calibrate widths so stacked landscapes (2 x landH + gapY) closely match tall reels (reelH)
    const wLandscape = Math.round(totalColsW * 0.40);
    const wReel = Math.floor((totalColsW - wLandscape) / 2);

    const landMediaH = Math.round(wLandscape / (16 / 9));
    const landH = landMediaH + textHeight;

    const reelMediaH = Math.round(wReel * (16 / 9));
    const reelH = reelMediaH + textHeight;

    // Group 1:
    // Left: Two landscape videos stacked (L0, L1)
    // Right: Pair of tall reels (P0, P1)
    const xCol0 = 0;
    const xCol1 = wLandscape + gapX;
    const xCol2 = xCol1 + wReel + gapX;

    if (landscapes.length >= 1) {
      const l0 = landscapes[0];
      cards.push({
        project: l0,
        isPortrait: false,
        x: xCol0,
        y: 0,
        w: wLandscape,
        h: landH,
        mediaH: landMediaH,
        colIdx: 0,
        centerX: xCol0 + wLandscape / 2,
        centerY: landH / 2,
      });
    }

    if (landscapes.length >= 2) {
      const l1 = landscapes[1];
      const yL1 = landH + gapY;
      cards.push({
        project: l1,
        isPortrait: false,
        x: xCol0,
        y: yL1,
        w: wLandscape,
        h: landH,
        mediaH: landMediaH,
        colIdx: 0,
        centerX: xCol0 + wLandscape / 2,
        centerY: yL1 + landH / 2,
      });
    }

    if (portraits.length >= 1) {
      const p0 = portraits[0];
      const yP0 = 36; // Subtle organic stagger
      cards.push({
        project: p0,
        isPortrait: true,
        x: xCol1,
        y: yP0,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 1,
        centerX: xCol1 + wReel / 2,
        centerY: yP0 + reelH / 2,
      });
    }

    if (portraits.length >= 2) {
      const p1 = portraits[1];
      const yP1 = 16;
      cards.push({
        project: p1,
        isPortrait: true,
        x: xCol2,
        y: yP1,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 2,
        centerX: xCol2 + wReel / 2,
        centerY: yP1 + reelH / 2,
      });
    }

    // Group 2 (Varied arrangement down):
    // Invert composition: pair of tall reels on left (P2, P3), stacked landscapes on right (L2, L3)
    const group1Bottom = Math.max(landH * 2 + gapY, 36 + reelH);
    const group2StartY = group1Bottom + gapY;

    const xG2Col0 = 0;
    const xG2Col1 = wReel + gapX;
    const xG2Col2 = xG2Col1 + wReel + gapX;

    if (portraits.length >= 3) {
      const p2 = portraits[2];
      const yP2 = group2StartY + 20;
      cards.push({
        project: p2,
        isPortrait: true,
        x: xG2Col0,
        y: yP2,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 0,
        centerX: xG2Col0 + wReel / 2,
        centerY: yP2 + reelH / 2,
      });
    }

    if (portraits.length >= 4) {
      const p3 = portraits[3];
      const yP3 = group2StartY;
      cards.push({
        project: p3,
        isPortrait: true,
        x: xG2Col1,
        y: yP3,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 1,
        centerX: xG2Col1 + wReel / 2,
        centerY: yP3 + reelH / 2,
      });
    }

    if (landscapes.length >= 3) {
      const l2 = landscapes[2];
      const yL2 = group2StartY + 12;
      cards.push({
        project: l2,
        isPortrait: false,
        x: xG2Col2,
        y: yL2,
        w: wLandscape,
        h: landH,
        mediaH: landMediaH,
        colIdx: 2,
        centerX: xG2Col2 + wLandscape / 2,
        centerY: yL2 + landH / 2,
      });
    }

    if (landscapes.length >= 4) {
      const l3 = landscapes[3];
      const yL3 = group2StartY + 12 + landH + gapY;
      cards.push({
        project: l3,
        isPortrait: false,
        x: xG2Col2,
        y: yL3,
        w: wLandscape,
        h: landH,
        mediaH: landMediaH,
        colIdx: 2,
        centerX: xG2Col2 + wLandscape / 2,
        centerY: yL3 + landH / 2,
      });
    }

    // Group 3 (Distribute remaining reels P4 & P5):
    const group2Bottom = group2StartY + Math.max(reelH + 20, 12 + landH * 2 + gapY);
    const group3StartY = group2Bottom + gapY;

    // Center the remaining pair of reels across the layout with subtle stagger
    const centerOffset = Math.floor((contentWidth - (2 * wReel + gapX)) / 2);

    if (portraits.length >= 5) {
      const p4 = portraits[4];
      const yP4 = group3StartY;
      cards.push({
        project: p4,
        isPortrait: true,
        x: centerOffset,
        y: yP4,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 1,
        centerX: centerOffset + wReel / 2,
        centerY: yP4 + reelH / 2,
      });
    }

    if (portraits.length >= 6) {
      const p5 = portraits[5];
      const yP5 = group3StartY + 32;
      cards.push({
        project: p5,
        isPortrait: true,
        x: centerOffset + wReel + gapX,
        y: yP5,
        w: wReel,
        h: reelH,
        mediaH: reelMediaH,
        colIdx: 2,
        centerX: centerOffset + wReel + gapX + wReel / 2,
        centerY: yP5 + reelH / 2,
      });
    }
  }

  const centersY = cards.map((c) => c.centerY);
  const minY = centersY.length > 0 ? Math.min(...centersY) : 0;
  const maxY = centersY.length > 0 ? Math.max(...centersY) : 0;
  const totalHeight = cards.length > 0 ? Math.max(...cards.map((c) => c.y + c.h)) : 0;

  return {
    contentWidth,
    totalHeight,
    cards,
    minY,
    maxY,
    numCols: isMobile ? 2 : 3,
  };
}
