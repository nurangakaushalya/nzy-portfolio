export const DEFAULT_HERO_VOLUME = 0.15; // 15% for native HTML5 video (0.0 to 1.0 scale)
export const DEFAULT_HERO_YOUTUBE_VOLUME = 15; // 15% for YouTube Player API (0 to 100 scale)

export interface PlayerVolumeState {
  hasInitialized: boolean;
  userChosenVolume: number | null;
}

/**
 * Creates a fresh volume state tracking object for a player instance.
 */
export function createPlayerVolumeState(): PlayerVolumeState {
  return {
    hasInitialized: false,
    userChosenVolume: null,
  };
}

/**
 * Applies default volume (0.15) to a native HTML5 video element once per player instance.
 * If the user has manually chosen a custom volume during their session, preserves that volume.
 */
export function applyNativeVideoVolume(
  video: { volume: number; muted: boolean },
  state: PlayerVolumeState,
  defaultVolume = DEFAULT_HERO_VOLUME
): void {
  if (!state.hasInitialized) {
    video.volume = defaultVolume;
    state.hasInitialized = true;
  } else if (state.userChosenVolume !== null) {
    video.volume = state.userChosenVolume;
  }
}

/**
 * Applies default volume (15) to a YouTube player instance once per player instance.
 * If the user has manually chosen a custom volume during their session, preserves that volume.
 */
export function applyYouTubePlayerVolume(
  player: { setVolume: (vol: number) => void; getVolume?: () => number },
  state: PlayerVolumeState,
  defaultVolume = DEFAULT_HERO_YOUTUBE_VOLUME
): void {
  if (!state.hasInitialized) {
    player.setVolume(defaultVolume);
    state.hasInitialized = true;
  } else if (state.userChosenVolume !== null) {
    player.setVolume(state.userChosenVolume);
  }
}

/**
 * Records a visitor-chosen volume when adjusted via browser controls/media keys.
 */
export function recordUserChosenVolume(
  volume: number,
  state: PlayerVolumeState,
  defaultVolume = DEFAULT_HERO_VOLUME
): void {
  if (state.hasInitialized && Math.abs(volume - defaultVolume) > 0.005) {
    state.userChosenVolume = volume;
  }
}
