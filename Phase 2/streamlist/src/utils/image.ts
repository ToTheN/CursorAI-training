import { TMDB_IMAGE_BASE_URL } from '@env';

/** Cast avatars, small thumbnails */
export const IMAGE_SIZE_CAST: string = 'w185';
/** Standard portrait content cards */
export const IMAGE_SIZE_CARD: string = 'w342';
/** Home hero portrait (poster) */
export const IMAGE_SIZE_HERO: string = 'w500';
/** Detail screen backdrop */
export const IMAGE_SIZE_BACKDROP: string = 'w780';

const DEFAULT_SIZE: string = IMAGE_SIZE_CARD;

/**
 * Builds a full TMDB image URL for a poster or backdrop path.
 */
export function buildImageUrl(
  path: string | null | undefined,
  size: string = DEFAULT_SIZE,
): string | null {
  if (path == null || path.length === 0) {
    return null;
  }
  const base: string =
    typeof TMDB_IMAGE_BASE_URL === 'string' && TMDB_IMAGE_BASE_URL.length > 0
      ? TMDB_IMAGE_BASE_URL
      : 'https://image.tmdb.org/t/p/';
  return `${base}${size}${path}`;
}
