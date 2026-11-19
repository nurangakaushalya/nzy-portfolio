export const BRAND_CONFIG = {
  name: 'Nzy',
  tagline: 'Video editing and graphic design studio.',
  copyrightYear: 2026,
  /**
   * Configure the business WhatsApp number in international digits-only format
   * without '+' or spaces (e.g. '15550199999').
   * Leave empty ('') in prototype mode to show the prepared message notice
   * without opening an invalid external wa.me link.
   */
  whatsappBusinessNumber: '94763819190',
  maxLocalImageBytes: 500 * 1024, // 500 KB limit for browser localStorage prototype uploads
  serviceOptions: [
    'Video Editing',
    'Commercial / Brand Film',
    'Social Media Reels',
    'Music Video',
    'Corporate Video',
    'Motion Graphics',
    'Graphic Design',
    'Video & Design Package',
  ],
} as const;

export { SHOWREEL_CONFIG } from './showreel';
