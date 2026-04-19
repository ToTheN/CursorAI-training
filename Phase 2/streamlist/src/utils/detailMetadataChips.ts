import type { MovieDetails } from '../api/types';

export interface DetailMetadataChipLabels {
  labels: string[];
}

/**
 * Builds metadata chip labels in order: Year | Rating | Genre | Runtime.
 * Omits year when release date is too short, rating when 0, runtime when null/0.
 */
export function buildDetailMetadataChipLabels(details: MovieDetails): DetailMetadataChipLabels {
  const labels: string[] = [];
  const year: string | null =
    details.release_date.length >= 4 ? details.release_date.slice(0, 4) : null;
  if (year !== null && year.length > 0) {
    labels.push(year);
  }
  if (details.vote_average > 0) {
    labels.push(`★ ${details.vote_average.toFixed(1)}`);
  }
  const genreLine: string = details.genres.map((g) => g.name).join(', ');
  if (genreLine.length > 0) {
    labels.push(genreLine);
  }
  if (details.runtime !== null && details.runtime > 0) {
    labels.push(`${details.runtime} min`);
  }
  return { labels };
}
