const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts a valid 11-character YouTube video ID from common YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

  if (host === 'youtu.be') {
    const candidate = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
  }

  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    if (parsed.pathname === '/watch') {
      const v = parsed.searchParams.get('v') ?? '';
      return YOUTUBE_ID_REGEX.test(v) ? v : null;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (
      segments.length >= 2 &&
      (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'live')
    ) {
      const candidate = segments[1];
      return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
    }
  }

  return null;
}

export function isValidYouTubeUrl(rawUrl: string): boolean {
  if (!rawUrl.trim()) {
    return true; // Optional field when blank
  }
  return extractYouTubeId(rawUrl) !== null;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (autoplay) {
    params.set('autoplay', '1');
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Builds an embedded YouTube preview URL configured for silent, seamless inline preview loops:
 * - autoplay=1: begins playing immediately upon mount
 * - mute=1: muted audio on hover/tap
 * - controls=0: minimal chrome without player buttons
 * - loop=1 & playlist=videoId: single-video continuous looping in the YouTube player
 * - modestbranding=1 & rel=0: clean presentation without related video suggestions
 * - playsinline=1: inline mobile playback
 */
export function getYouTubePreviewUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoId,
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    enablejsapi: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
