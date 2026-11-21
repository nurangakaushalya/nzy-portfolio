import { DEFAULT_HERO_VOLUME } from '../utils/showreelVolume';

export interface ShowreelConfig {
  videoUrl: string;
  posterUrl: string;
  focalPosition: string;
  aspectRatio: string;
  defaultVolume?: number;
}

export { DEFAULT_HERO_VOLUME, DEFAULT_HERO_YOUTUBE_VOLUME } from '../utils/showreelVolume';

export const SHOWREEL_CONFIG: ShowreelConfig = {
  videoUrl: '/videos/nzy-showreel.mp4',
  posterUrl: '/images/nzy-showreel-poster.jpg',
  focalPosition: 'center',
  aspectRatio: '16/9',
  defaultVolume: DEFAULT_HERO_VOLUME,
};
