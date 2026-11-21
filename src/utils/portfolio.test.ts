import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubePreviewUrl,
  isValidYouTubeUrl,
} from './youtube';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  validateContactForm,
} from './whatsapp';
import {
  canDeleteCategory,
  filterPublicProjects,
  getCategoryCounts,
  reorderProjects,
} from './portfolioFilters';
import { hashString, packStaggeredGallery } from './galleryPacking';
import {
  DEFAULT_HERO_VOLUME,
  DEFAULT_HERO_YOUTUBE_VOLUME,
  applyNativeVideoVolume,
  applyYouTubePlayerVolume,
  createPlayerVolumeState,
  recordUserChosenVolume,
} from './showreelVolume';
import { SHOWREEL_CONFIG } from '../config/showreel';
import { DEFAULT_PROJECTS } from '../data/seedData';
import type { Category, Project } from '../types/portfolio';

test('extractYouTubeId handles standard, short, embed, and shorts URLs', () => {
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=aqz-KE-bpKQ'),
    'aqz-KE-bpKQ'
  );
  assert.equal(
    extractYouTubeId('https://youtu.be/YE7VzlLtp-4?t=15'),
    'YE7VzlLtp-4'
  );
  assert.equal(
    extractYouTubeId('https://www.youtube.com/embed/aqz-KE-bpKQ'),
    'aqz-KE-bpKQ'
  );
  assert.equal(
    extractYouTubeId('https://www.youtube.com/shorts/YE7VzlLtp-4'),
    'YE7VzlLtp-4'
  );
  assert.equal(extractYouTubeId('https://vimeo.com/123456'), null);
  assert.equal(extractYouTubeId('not-a-url'), null);
});

test('isValidYouTubeUrl accepts blank optional value and rejects malformed URLs', () => {
  assert.equal(isValidYouTubeUrl(''), true);
  assert.equal(isValidYouTubeUrl('https://youtu.be/aqz-KE-bpKQ'), true);
  assert.equal(isValidYouTubeUrl('https://example.com/video.mp4'), false);
});

test('getYouTubeEmbedUrl builds clean embed URL with autoplay toggle', () => {
  const url = getYouTubeEmbedUrl('aqz-KE-bpKQ', true);
  assert.match(url, /^https:\/\/www\.youtube\.com\/embed\/aqz-KE-bpKQ\?/);
  assert.match(url, /autoplay=1/);
  assert.match(url, /rel=0/);
});

test('validateContactForm enforces required fields and length', () => {
  const emptyErrors = validateContactForm({ name: '', service: '', message: '' });
  assert.ok(emptyErrors.name);
  assert.ok(emptyErrors.service);
  assert.ok(emptyErrors.message);

  const validErrors = validateContactForm({
    name: 'Samira',
    service: 'Video Editing',
    message: 'Looking for a 45-second launch commercial edit.',
  });
  assert.deepEqual(validErrors, {});
});

test('buildWhatsAppUrl handles unconfigured and configured numbers cleanly', () => {
  const msg = buildWhatsAppMessage({
    name: 'Alex',
    service: 'Motion Graphics',
    message: 'Need kinetic title graphics for an event.',
  });
  assert.match(msg, /Name: Alex/);
  assert.match(msg, /Service needed: Motion Graphics/);

  const unconfigured = buildWhatsAppUrl('', msg);
  assert.equal(unconfigured.isConfigured, false);
  assert.equal(unconfigured.url, null);

  const configured = buildWhatsAppUrl('+1 (555) 012-3456', msg);
  assert.equal(configured.isConfigured, true);
  assert.equal(configured.normalizedNumber, '15550123456');
  assert.ok(configured.url?.startsWith('https://wa.me/15550123456?text='));
});

const SAMPLE_CATS: Category[] = [
  { id: 'c1', name: 'Commercials', order: 0 },
  { id: 'c2', name: 'Graphic Design', order: 1 },
  { id: 'c3', name: 'Empty Cat', order: 2 },
];

const SAMPLE_PROJS: Project[] = [
  {
    id: 'p1',
    title: 'Watch Spot',
    type: 'video',
    categoryId: 'c1',
    description: 'Macro commercial edit.',
    services: ['Editing'],
    thumbnailUrl: '/thumb1.jpg',
    status: 'published',
    order: 0,
  },
  {
    id: 'p2',
    title: 'Hidden Spot',
    type: 'video',
    categoryId: 'c1',
    description: 'Secret draft spot.',
    services: ['Editing'],
    thumbnailUrl: '/thumb2.jpg',
    status: 'hidden',
    order: 1,
  },
  {
    id: 'p3',
    title: 'Monolith Identity',
    type: 'design',
    categoryId: 'c2',
    description: 'Packaging and stationery.',
    services: ['Brand Identity'],
    thumbnailUrl: '/thumb3.jpg',
    status: 'published',
    order: 2,
  },
];

test('filterPublicProjects excludes hidden items and applies category + search together', () => {
  const all = filterPublicProjects(SAMPLE_PROJS, 'all', '');
  assert.equal(all.length, 2);
  assert.deepEqual(
    all.map((p) => p.id),
    ['p1', 'p3']
  );

  const searchHidden = filterPublicProjects(SAMPLE_PROJS, 'all', 'Secret');
  assert.equal(searchHidden.length, 0);

  const searchDesc = filterPublicProjects(SAMPLE_PROJS, 'c2', 'packaging');
  assert.equal(searchDesc.length, 1);
  assert.equal(searchDesc[0].id, 'p3');
});

test('getCategoryCounts counts only published projects for public display', () => {
  const counts = getCategoryCounts(SAMPLE_PROJS, SAMPLE_CATS);
  assert.equal(counts[0].publishedCount, 1);
  assert.equal(counts[0].totalCount, 2);
  assert.equal(counts[2].publishedCount, 0);
});

test('canDeleteCategory blocks deletion when any project (even hidden) exists', () => {
  assert.equal(canDeleteCategory('c1', SAMPLE_PROJS).allowed, false);
  assert.equal(canDeleteCategory('c3', SAMPLE_PROJS).allowed, true);
});

test('reorderProjects swaps adjacent items and normalizes order', () => {
  const movedDown = reorderProjects(SAMPLE_PROJS, 'p1', 'down');
  assert.deepEqual(
    movedDown.map((p) => p.id),
    ['p2', 'p1', 'p3']
  );
  assert.deepEqual(
    movedDown.map((p) => p.order),
    [0, 1, 2]
  );

  const boundary = reorderProjects(SAMPLE_PROJS, 'p1', 'up');
  assert.deepEqual(
    boundary.map((p) => p.id),
    ['p1', 'p2', 'p3']
  );
});

import { buildWorkRows, isPortraitProject } from './projectOrientation';

test('isPortraitProject detects explicit metadata, category, and heuristics', () => {
  const p1: Project = {
    ...SAMPLE_PROJS[0],
    orientation: 'portrait',
  };
  assert.equal(isPortraitProject(p1), true);

  const p2: Project = {
    ...SAMPLE_PROJS[0],
    aspectRatio: '9:16',
  };
  assert.equal(isPortraitProject(p2), true);

  const p3: Project = {
    ...SAMPLE_PROJS[0],
    categoryId: 'cat-reels',
  };
  assert.equal(isPortraitProject(p3), true);

  const p4: Project = {
    ...SAMPLE_PROJS[0],
    title: 'Fashion Reel — Summer Drop',
  };
  assert.equal(isPortraitProject(p4), true);

  const p5: Project = {
    ...SAMPLE_PROJS[0],
    title: 'Automotive Commercial 16:9',
    aspectRatio: '16:9',
  };
  assert.equal(isPortraitProject(p5), false);
});

test('buildWorkRows handles mixed pairs, alternating order, and odd leftovers', () => {
  const l1: Project = { ...SAMPLE_PROJS[0], id: 'l1' };
  const l2: Project = { ...SAMPLE_PROJS[0], id: 'l2' };
  const l3: Project = { ...SAMPLE_PROJS[0], id: 'l3' };
  const r1: Project = { ...SAMPLE_PROJS[0], id: 'r1', categoryId: 'cat-reels' };
  const r2: Project = { ...SAMPLE_PROJS[0], id: 'r2', categoryId: 'cat-reels' };

  // Mixed pair test: 3 landscapes, 2 reels
  const rows = buildWorkRows([l1, l2, r1, r2, l3]);
  assert.equal(rows.length, 3);

  // Pair 0: Mixed, landscape-first (l1 on left, r1 on right)
  assert.equal(rows[0].type, 'mixed');
  if (rows[0].type === 'mixed') {
    assert.equal(rows[0].pattern, 'landscape-first');
    assert.equal(rows[0].left.id, 'l1');
    assert.equal(rows[0].right.id, 'r1');
  }

  // Pair 1: Mixed, portrait-first (r2 on left, l2 on right)
  assert.equal(rows[1].type, 'mixed');
  if (rows[1].type === 'mixed') {
    assert.equal(rows[1].pattern, 'portrait-first');
    assert.equal(rows[1].left.id, 'r2');
    assert.equal(rows[1].right.id, 'l2');
  }

  // Remaining: l3 as single landscape retaining natural proportions
  assert.equal(rows[2].type, 'single');
  if (rows[2].type === 'single') {
    assert.equal(rows[2].project.id, 'l3');
    assert.equal(rows[2].format, 'landscape');
  }

  // Landscape-only test: 2 landscapes
  const landscapeOnly = buildWorkRows([l1, l2]);
  assert.equal(landscapeOnly.length, 1);
  assert.equal(landscapeOnly[0].type, 'landscape-pair');

  // Reels-only test: 2 reels
  const reelsOnly = buildWorkRows([r1, r2]);
  assert.equal(reelsOnly.length, 1);
  assert.equal(reelsOnly[0].type, 'reels-pair');
});

test('hashString produces stable deterministic 32-bit positive values', () => {
  const h1 = hashString('proj-chronograph-film');
  const h2 = hashString('proj-chronograph-film');
  const h3 = hashString('proj-night-outerwear-reel');

  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.ok(h1 > 0);
  assert.ok(Number.isInteger(h1));
});

test('packStaggeredGallery packs mixed formats tightly with staggered heights and no overlaps', () => {
  const l1: Project = { ...SAMPLE_PROJS[0], id: 'l1', order: 0 };
  const l2: Project = { ...SAMPLE_PROJS[0], id: 'l2', order: 1 };
  const r1: Project = { ...SAMPLE_PROJS[0], id: 'r1', categoryId: 'cat-reels', order: 2 };
  const r2: Project = { ...SAMPLE_PROJS[0], id: 'r2', categoryId: 'cat-reels', order: 3 };
  const l3: Project = { ...SAMPLE_PROJS[0], id: 'l3', order: 4 };
  const l4: Project = { ...SAMPLE_PROJS[0], id: 'l4', order: 5 };

  const desktopLayout = packStaggeredGallery([l1, l2, r1, r2, l3, l4], 1280);
  assert.equal(desktopLayout.cards.length, 6);
  assert.ok(desktopLayout.contentWidth > 1000);
  assert.ok(desktopLayout.totalHeight > 500);

  // Check stability: repeated call produces identical coordinates
  const repeatLayout = packStaggeredGallery([l1, l2, r1, r2, l3, l4], 1280);
  for (let i = 0; i < desktopLayout.cards.length; i++) {
    assert.equal(desktopLayout.cards[i].x, repeatLayout.cards[i].x);
    assert.equal(desktopLayout.cards[i].y, repeatLayout.cards[i].y);
    assert.equal(desktopLayout.cards[i].w, repeatLayout.cards[i].w);
    assert.equal(desktopLayout.cards[i].h, repeatLayout.cards[i].h);
  }

  // Check no overlaps between any pair of cards on desktop
  const cards = desktopLayout.cards;
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i];
      const b = cards[j];
      const overlapX = !(a.x + a.w <= b.x || b.x + b.w <= a.x);
      const overlapY = !(a.y + a.h <= b.y || b.y + b.h <= a.y);
      assert.ok(
        !(overlapX && overlapY),
        `Cards ${a.project.id} and ${b.project.id} overlap: A(${a.x},${a.y},${a.w},${a.h}) vs B(${b.x},${b.y},${b.w},${b.h})`
      );
    }
  }

  // Check mobile packing has 2 columns
  const mobileLayout = packStaggeredGallery([l1, l2, r1, r2, l3, l4], 390);
  assert.equal(mobileLayout.numCols, 2);
  assert.equal(mobileLayout.cards.length, 6);
  for (let i = 0; i < mobileLayout.cards.length; i++) {
    for (let j = i + 1; j < mobileLayout.cards.length; j++) {
      const a = mobileLayout.cards[i];
      const b = mobileLayout.cards[j];
      const overlapX = !(a.x + a.w <= b.x || b.x + b.w <= a.x);
      const overlapY = !(a.y + a.h <= b.y || b.y + b.h <= a.y);
      assert.ok(
        !(overlapX && overlapY),
        `Mobile cards ${a.project.id} and ${b.project.id} overlap`
      );
    }
  }
});

test('packStaggeredGallery packs 10 projects (6 portrait 9:16 and 4 landscape 16:9) with exact composition', () => {
  const videoProjects = DEFAULT_PROJECTS.filter((p) => p.status === 'published' && p.type === 'video');
  assert.equal(videoProjects.length, 10);

  // Desktop (1280px)
  const desktop = packStaggeredGallery(videoProjects, 1280);
  assert.equal(desktop.cards.length, 10);

  const desktopPortraits = desktop.cards.filter((c) => c.isPortrait);
  const desktopLandscapes = desktop.cards.filter((c) => !c.isPortrait);
  assert.equal(desktopPortraits.length, 6);
  assert.equal(desktopLandscapes.length, 4);

  // Verify Group 1 on desktop: two landscape videos stacked beside a pair of tall reels
  // Two stacked landscapes in col 0 (L0 at y=0, L1 at y=landH+gap)
  assert.equal(desktopLandscapes[0].x, 0);
  assert.equal(desktopLandscapes[1].x, 0);
  assert.ok(desktopLandscapes[1].y > desktopLandscapes[0].y);

  // Pair of tall reels beside them (P0 in col 1, P1 in col 2)
  assert.ok(desktopPortraits[0].x > desktopLandscapes[0].w);
  assert.ok(desktopPortraits[1].x > desktopPortraits[0].x);

  // Verify reachability: maxY center is reachable for final video
  assert.ok(desktop.maxY > desktop.minY);
  const lastCardCenter = Math.max(...desktop.cards.map((c) => c.centerY));
  assert.equal(desktop.maxY, lastCardCenter);

  // Mobile (390px)
  const mobile = packStaggeredGallery(videoProjects, 390);
  assert.equal(mobile.cards.length, 10);

  const mobilePortraits = mobile.cards.filter((c) => c.isPortrait);
  const mobileLandscapes = mobile.cards.filter((c) => !c.isPortrait);
  assert.equal(mobilePortraits.length, 6);
  assert.equal(mobileLandscapes.length, 4);

  // Mobile: portrait reels paired side-by-side
  // P0 & P1 have identical y and are side by side
  assert.equal(mobilePortraits[0].y, mobilePortraits[1].y);
  assert.equal(mobilePortraits[0].x, 0);
  assert.ok(mobilePortraits[1].x > 0);

  // Mobile: landscape videos span full available width
  for (const land of mobileLandscapes) {
    assert.equal(land.w, mobile.contentWidth);
    assert.equal(land.x, 0);
  }
});

import { syncYouTubeVideoProjects } from '../data/portfolioRepository';
import { TARGET_YOUTUBE_VIDEOS } from '../data/seedData';

test('getYouTubePreviewUrl builds loopable muted preview URL for inline player', () => {
  const url = getYouTubePreviewUrl('xYUpfTtWV_c');
  assert.match(url, /^https:\/\/www\.youtube-nocookie\.com\/embed\/xYUpfTtWV_c\?/);
  assert.match(url, /autoplay=1/);
  assert.match(url, /mute=1/);
  assert.match(url, /controls=0/);
  assert.match(url, /loop=1/);
  assert.match(url, /playlist=xYUpfTtWV_c/);
  assert.match(url, /rel=0/);
  assert.match(url, /playsinline=1/);
});

test('syncYouTubeVideoProjects matches existing entries by YouTube video ID and is idempotent', () => {
  // Test 1: First sync on DEFAULT_PROJECTS
  const firstSync = syncYouTubeVideoProjects(DEFAULT_PROJECTS);
  const videoCards1 = firstSync.filter((p) => p.type === 'video');
  assert.equal(videoCards1.length, 10);

  // Verify the exact 10 YouTube video IDs in order
  const targetIds = TARGET_YOUTUBE_VIDEOS.map((v) => v.youtubeId);
  const syncedIds1 = videoCards1.map((p) => extractYouTubeId(p.youtubeUrl || ''));
  assert.deepEqual(syncedIds1, targetIds);

  // Test 2: Idempotency — running sync a second time produces the exact same 10 cards
  const secondSync = syncYouTubeVideoProjects(firstSync);
  const videoCards2 = secondSync.filter((p) => p.type === 'video');
  assert.equal(videoCards2.length, 10);
  assert.deepEqual(
    videoCards2.map((p) => p.id),
    videoCards1.map((p) => p.id)
  );
  assert.deepEqual(
    videoCards2.map((p) => p.title),
    videoCards1.map((p) => p.title)
  );
  assert.deepEqual(
    videoCards2.map((p) => p.order),
    videoCards1.map((p) => p.order)
  );

  // Test 3: Existing customizations are preserved when matched by YouTube ID
  const customized = firstSync.map((p) =>
    p.id === 'proj-yt-xYUpfTtWV_c'
      ? { ...p, title: 'Custom Reel Title', description: 'Custom edited description' }
      : p
  );
  const thirdSync = syncYouTubeVideoProjects(customized);
  const matchedCard = thirdSync.find((p) => p.id === 'proj-yt-xYUpfTtWV_c');
  assert.ok(matchedCard);
  assert.equal(matchedCard.title, 'Custom Reel Title');
  assert.equal(matchedCard.description, 'Custom edited description');

  // Test 4: Non-video projects (e.g. design) are preserved
  const designCards = thirdSync.filter((p) => p.type === 'design');
  assert.equal(designCards.length, 2);
});

test('final reel (_UtuPc1tXz4) reaches maxY center on both desktop and mobile layouts', () => {
  const videoProjects = DEFAULT_PROJECTS.filter(
    (p) => p.status === 'published' && p.type === 'video'
  );

  // Desktop
  const desktop = packStaggeredGallery(videoProjects, 1280);
  const desktopLastCard = desktop.cards.reduce((max, c) =>
    c.centerY > max.centerY ? c : max
  );
  assert.equal(extractYouTubeId(desktopLastCard.project.youtubeUrl || ''), '_UtuPc1tXz4');
  assert.equal(desktopLastCard.centerY, desktop.maxY);

  // Mobile
  const mobile = packStaggeredGallery(videoProjects, 390);
  const mobileLastCard = mobile.cards.reduce((max, c) =>
    c.centerY > max.centerY ? c : max
  );
  assert.equal(extractYouTubeId(mobileLastCard.project.youtubeUrl || ''), '_UtuPc1tXz4');
  assert.equal(mobileLastCard.centerY, mobile.maxY);
});

import {
  calculateBlockProgress,
  getWordFactor,
  interpolateColor,
  MUTED_GRAY,
  WHITE,
  ORANGE,
} from './textReveal';

test('interpolateColor transitions smoothly from muted gray to white or orange and clamps', () => {
  // Factor 0: muted gray
  assert.equal(interpolateColor(MUTED_GRAY, WHITE, 0), 'rgb(90, 90, 90)');
  assert.equal(interpolateColor(MUTED_GRAY, ORANGE, 0), 'rgb(90, 90, 90)');

  // Clamped negative factor
  assert.equal(interpolateColor(MUTED_GRAY, WHITE, -0.5), 'rgb(90, 90, 90)');

  // Factor 1: target colors
  assert.equal(interpolateColor(MUTED_GRAY, WHITE, 1), 'rgb(255, 255, 255)');
  assert.equal(interpolateColor(MUTED_GRAY, ORANGE, 1), 'rgb(255, 106, 0)');

  // Clamped factor > 1
  assert.equal(interpolateColor(MUTED_GRAY, ORANGE, 1.5), 'rgb(255, 106, 0)');

  // Factor 0.5: midpoint
  const midWhite = interpolateColor(MUTED_GRAY, WHITE, 0.5);
  assert.equal(midWhite, 'rgb(173, 173, 173)');
  const midOrange = interpolateColor(MUTED_GRAY, ORANGE, 0.5);
  assert.equal(midOrange, 'rgb(173, 98, 45)');
});

test('calculateBlockProgress triggers at 75% vh in lower screen and reverses on scroll up', () => {
  const vh = 1000;
  // Above 75% (e.g. top = 800px): progress is 0 (muted gray)
  assert.equal(calculateBlockProgress(800, vh, 0.75, 0.30), 0);

  // Exactly at 75% (top = 750px): begins brightening
  assert.equal(calculateBlockProgress(750, vh, 0.75, 0.30), 0);

  // Midway through reveal (top = 600px): progress is 0.5
  assert.equal(calculateBlockProgress(600, vh, 0.75, 0.30), 0.5);

  // Completed reveal (top = 450px): progress is 1.0
  assert.equal(calculateBlockProgress(450, vh, 0.75, 0.30), 1);

  // Past completion (top = 300px): progress remains 1.0
  assert.equal(calculateBlockProgress(300, vh, 0.75, 0.30), 1);
});

test('getWordFactor brightens words in sequential reading order', () => {
  const totalWords = 6;

  // At progress 0: all words at 0
  for (let i = 0; i < totalWords; i++) {
    assert.equal(getWordFactor(0, i, totalWords), 0);
  }

  // At progress 0.20: word 0 is actively brightening while later words are still 0
  assert.ok(getWordFactor(0.20, 0, totalWords) > 0);
  assert.equal(getWordFactor(0.20, 4, totalWords), 0);
  assert.equal(getWordFactor(0.20, 5, totalWords), 0);

  // At progress 1.0: all words are 1.0
  for (let i = 0; i < totalWords; i++) {
    assert.equal(getWordFactor(1.0, i, totalWords), 1);
  }
});

test('packStaggeredGallery measures spacing directly from video edges with no reserved text space', () => {
  const videoProjects = DEFAULT_PROJECTS.filter(
    (p) => p.status === 'published' && p.type === 'video'
  );
  const layout = packStaggeredGallery(videoProjects, 1280);

  // Every card's total height matches its exact media height (zero text height reserved)
  for (const card of layout.cards) {
    assert.equal(card.h, card.mediaH);
  }
});

test('hero showreel default volume is 15% (0.15 for HTML5 video, 15 for YouTube API)', () => {
  assert.equal(DEFAULT_HERO_VOLUME, 0.15);
  assert.equal(DEFAULT_HERO_YOUTUBE_VOLUME, 15);
  assert.equal(SHOWREEL_CONFIG.defaultVolume, 0.15);
});

test('applyNativeVideoVolume sets default volume once and preserves visitor-chosen volume', () => {
  const state = createPlayerVolumeState();
  const mockVideo = { volume: 1.0, muted: false };

  // First call initializes default volume to 0.15
  applyNativeVideoVolume(mockVideo, state);
  assert.equal(state.hasInitialized, true);
  assert.equal(mockVideo.volume, 0.15);

  // Subsequent call (e.g. re-render, scroll, loop) without user change does not overwrite volume
  mockVideo.volume = 0.15;
  applyNativeVideoVolume(mockVideo, state);
  assert.equal(mockVideo.volume, 0.15);

  // Visitor adjusts volume to 0.40
  recordUserChosenVolume(0.4, state);
  assert.equal(state.userChosenVolume, 0.4);

  // Unmuting, looping, or re-rendering preserves the visitor-chosen volume of 0.40
  mockVideo.volume = 0.15; // simulate reset attempt
  applyNativeVideoVolume(mockVideo, state);
  assert.equal(mockVideo.volume, 0.4);
});

test('applyYouTubePlayerVolume sets volume to 15 once and preserves visitor-chosen volume', () => {
  const state = createPlayerVolumeState();
  let volumePassed = 0;
  const mockPlayer = {
    setVolume: (v: number) => {
      volumePassed = v;
    },
  };

  // Initial call sets volume to 15
  applyYouTubePlayerVolume(mockPlayer, state);
  assert.equal(state.hasInitialized, true);
  assert.equal(volumePassed, 15);

  // Subsequent call does not reset volume if user changed it
  state.userChosenVolume = 35;
  applyYouTubePlayerVolume(mockPlayer, state);
  assert.equal(volumePassed, 35);
});

test('gallery preview URLs strictly maintain muted state (mute=1)', () => {
  const sampleId = 'xYUpfTtWV_c';
  const previewUrl = getYouTubePreviewUrl(sampleId);
  const parsed = new URL(previewUrl);
  assert.equal(parsed.searchParams.get('mute'), '1');
  assert.equal(parsed.searchParams.get('autoplay'), '1');
});

