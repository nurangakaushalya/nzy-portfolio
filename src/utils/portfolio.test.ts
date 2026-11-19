import test from 'node:test';
import assert from 'node:assert/strict';
import { extractYouTubeId, getYouTubeEmbedUrl, isValidYouTubeUrl } from './youtube';
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
