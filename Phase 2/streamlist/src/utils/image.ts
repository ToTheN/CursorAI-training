import { TMDB_IMAGE_BASE_URL } from '@env';

const DEFAULT_SIZE: string = 'w500';

/**
 * Builds a full TMDB image URL for a poster or backdrop path.
 */
export function buildImageUrl(path: string | null, size: string = DEFAULT_SIZE): string | null {
  if (path === null || path.length === 0) {
    return null;
  }
  const base: string = TMDB_IMAGE_BASE_URL.length > 0 ? TMDB_IMAGE_BASE_URL : 'https://image.tmdb.org/t/p/';
  return `${base}${size}${path}`;
}
