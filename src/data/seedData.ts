import type { Category, PortfolioData, Project } from '../types/portfolio';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-commercials', name: 'Commercials', order: 0 },
  { id: 'cat-reels', name: 'Social Media Reels', order: 1 },
  { id: 'cat-music', name: 'Music Videos', order: 2 },
  { id: 'cat-corporate', name: 'Corporate Videos', order: 3 },
  { id: 'cat-motion', name: 'Motion Graphics', order: 4 },
  { id: 'cat-design', name: 'Graphic Design', order: 5 },
];

/**
 * 10 YouTube video projects in the requested mixed order:
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
 */
export const TARGET_YOUTUBE_VIDEOS = [
  {
    youtubeId: 'xYUpfTtWV_c',
    youtubeUrl: 'https://youtube.com/shorts/xYUpfTtWV_c',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Precision Mechanical Macro — Brand Cut',
    categoryId: 'cat-reels',
    duration: '00:28',
    services: ['Short-Form Editing', 'Beat Sync', 'Kinetic Captions'],
    description:
      'Fast-paced vertical social reel cut combining macro mechanical detail, beat-synced speed ramps, and restrained title typography.',
    thumbnailUrl: 'https://img.youtube.com/vi/xYUpfTtWV_c/hqdefault.jpg',
    order: 0,
  },
  {
    youtubeId: 'U4KAEAVKYFE',
    youtubeUrl: 'https://youtu.be/U4KAEAVKYFE',
    aspectRatio: '16:9' as const,
    orientation: 'landscape' as const,
    title: 'Chronograph Field — Product Launch Cut',
    categoryId: 'cat-commercials',
    duration: '00:45',
    services: ['Editorial Cut', 'Color Grading', 'Sound Design'],
    description:
      'Demonstration launch spot showcasing macro mechanical detail, rhythmic pacing, and warm tungsten color grading built for product campaigns.',
    thumbnailUrl: 'https://img.youtube.com/vi/U4KAEAVKYFE/hqdefault.jpg',
    order: 1,
  },
  {
    youtubeId: '4qZoG_Ce_j0',
    youtubeUrl: 'https://youtube.com/shorts/4qZoG_Ce_j0',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Single Origin Extraction — Social Series',
    categoryId: 'cat-reels',
    duration: '00:34',
    services: ['Reels Editing', 'Foley & Audio', 'Color Pass'],
    description:
      'Sensory micro-documentary reel highlighting tactile craft, slow-motion pours, and crisp acoustic foley.',
    thumbnailUrl: 'https://img.youtube.com/vi/4qZoG_Ce_j0/hqdefault.jpg',
    order: 2,
  },
  {
    youtubeId: 'PZhZyPE8Yso',
    youtubeUrl: 'https://youtu.be/PZhZyPE8Yso',
    aspectRatio: '16:9' as const,
    orientation: 'landscape' as const,
    title: 'Coastal Dusk — Automotive Commercial Spec',
    categoryId: 'cat-commercials',
    duration: '01:12',
    services: ['Commercial Editing', 'Sound Mixing', 'Finish & Mastering'],
    description:
      'High-contrast twilight driving commercial edit focused on clean transitions, atmospheric road soundscapes, and widescreen framing.',
    thumbnailUrl: 'https://img.youtube.com/vi/PZhZyPE8Yso/hqdefault.jpg',
    order: 3,
  },
  {
    youtubeId: 'fsQzxdZMZJQ',
    youtubeUrl: 'https://youtube.com/shorts/fsQzxdZMZJQ',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Kinetic Flow — Streetwear Beat Sync',
    categoryId: 'cat-reels',
    duration: '00:26',
    services: ['Short-Form Editing', 'Dynamic Typography', 'Audio Punch'],
    description:
      'Hook-driven vertical edit with rhythmic tempo cuts, camera punch-ins, and kinetic typography.',
    thumbnailUrl: 'https://img.youtube.com/vi/fsQzxdZMZJQ/hqdefault.jpg',
    order: 4,
  },
  {
    youtubeId: '9wdzkHByyHM',
    youtubeUrl: 'https://youtube.com/shorts/9wdzkHByyHM',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Amber Haze — Live Studio Session',
    categoryId: 'cat-music',
    duration: '00:30',
    services: ['Multicam Editing', 'Film Emulation Grade', 'Audio Sync'],
    description:
      'Intimate live studio acoustic session cut across dynamic angles with warm analog film emulation and tight audio synchronization.',
    thumbnailUrl: 'https://img.youtube.com/vi/9wdzkHByyHM/hqdefault.jpg',
    order: 5,
  },
  {
    youtubeId: '7LdyzIjFS58',
    youtubeUrl: 'https://youtu.be/7LdyzIjFS58',
    aspectRatio: '16:9' as const,
    orientation: 'landscape' as const,
    title: 'Material Practice — Architectural Studio Film',
    categoryId: 'cat-corporate',
    duration: '02:35',
    services: ['Documentary Editing', 'Dialogue Cleanup', 'Lower Thirds'],
    description:
      'Measured studio profile documentary weaving interview dialogue with clean spatial cutaways and architectural detail.',
    thumbnailUrl: 'https://img.youtube.com/vi/7LdyzIjFS58/hqdefault.jpg',
    order: 6,
  },
  {
    youtubeId: 'UeJONAXGL3o',
    youtubeUrl: 'https://youtube.com/shorts/UeJONAXGL3o',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Tactile Roast — Micro Craft Reel',
    categoryId: 'cat-reels',
    duration: '00:30',
    services: ['Reels Editing', 'Foley & Audio', 'Macro Color'],
    description:
      'Close-up tactile craft reel with sensory sound design, rhythmic macro cutting, and calibrated studio color.',
    thumbnailUrl: 'https://img.youtube.com/vi/UeJONAXGL3o/hqdefault.jpg',
    order: 7,
  },
  {
    youtubeId: 'S1v_MS_xVAM',
    youtubeUrl: 'https://youtu.be/S1v_MS_xVAM',
    aspectRatio: '16:9' as const,
    orientation: 'landscape' as const,
    title: 'Tolerance & Craft — Workshop Overview',
    categoryId: 'cat-corporate',
    duration: '02:18',
    services: ['Corporate Editing', 'Callout Graphics', 'Sound Mastering'],
    description:
      'Industrial capability film structured around clear narration, machining process sequences, and technical callouts.',
    thumbnailUrl: 'https://img.youtube.com/vi/S1v_MS_xVAM/hqdefault.jpg',
    order: 8,
  },
  {
    youtubeId: '_UtuPc1tXz4',
    youtubeUrl: 'https://youtube.com/shorts/_UtuPc1tXz4',
    aspectRatio: '9:16' as const,
    orientation: 'portrait' as const,
    title: 'Obsidian Array — Event Motion Visuals',
    categoryId: 'cat-motion',
    duration: '00:29',
    services: ['3D Motion Design', 'Stage Formatting', 'Audio-Reactive'],
    description:
      'Modular vertical 3D title sequence, transition stingers, and audio-reactive visuals crafted for stage backdrops.',
    thumbnailUrl: 'https://img.youtube.com/vi/_UtuPc1tXz4/hqdefault.jpg',
    order: 9,
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  ...TARGET_YOUTUBE_VIDEOS.map((v) => ({
    id: `proj-yt-${v.youtubeId}`,
    title: v.title,
    type: 'video' as const,
    categoryId: v.categoryId,
    description: v.description,
    services: [...v.services],
    thumbnailUrl: v.thumbnailUrl,
    youtubeUrl: v.youtubeUrl,
    duration: v.duration,
    aspectRatio: v.aspectRatio,
    orientation: v.orientation,
    status: 'published' as const,
    order: v.order,
  })),
  {
    id: 'proj-tactile-stationery-identity',
    title: 'Monolith Stationery & Packaging System',
    type: 'design',
    categoryId: 'cat-design',
    description:
      'Demonstration identity system pairing embossed charcoal stocks, foil edge detailing, and rigid box Swiss grid packaging.',
    services: ['Brand Identity', 'Packaging Layout', 'Print Production Files'],
    thumbnailUrl: '/src/assets/images/design_monolith_brand_1794892282933.jpg',
    galleryImages: [
      '/src/assets/images/design_monolith_brand_1794892282933.jpg',
      '/src/assets/images/design_monolith_packaging_1794892283097.jpg',
      '/src/assets/images/design_poster_detail_1794892283393.jpg',
    ],
    status: 'published',
    order: 10,
  },
  {
    id: 'proj-grid-exhibition-posters',
    title: 'Grid Systems — Exhibition Poster & Lookbook',
    type: 'design',
    categoryId: 'cat-design',
    description:
      'Editorial poster triptych and companion print lookbook built on strict modular typography and high-contrast photography.',
    services: ['Editorial Layout', 'Poster Design', 'Typographic Direction'],
    thumbnailUrl: '/src/assets/images/design_poster_series_1794892283720.jpg',
    galleryImages: [
      '/src/assets/images/design_poster_series_1794892283720.jpg',
      '/src/assets/images/design_poster_detail_1794892283393.jpg',
      '/src/assets/images/design_monolith_packaging_1794892283097.jpg',
    ],
    status: 'published',
    order: 11,
  },
];

export function createDefaultPortfolioData(): PortfolioData {
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    projects: DEFAULT_PROJECTS.map((p) => ({
      ...p,
      services: [...p.services],
      galleryImages: p.galleryImages ? [...p.galleryImages] : undefined,
    })),
  };
}
