import type { MovieDetails, TvDetails } from '../api/types';

function joinYearAndGenre(year: string, genreName: string): string {
  if (year.length > 0 && genreName.length > 0) {
    return `${year} • ${genreName}`;
  }
  if (year.length > 0) {
    return year;
  }
  if (genreName.length > 0) {
    return genreName;
  }
  return '';
}

export function buildWatchlistSubtitleFromMovieDetails(details: MovieDetails): string {
  const year: string =
    details.release_date.length >= 4 ? details.release_date.slice(0, 4) : '';
  const genrePart: string = details.genres[0]?.name ?? '';
  return joinYearAndGenre(year, genrePart);
}

export function buildWatchlistSubtitleFromTvDetails(details: TvDetails): string {
  const year: string =
    details.first_air_date.length >= 4 ? details.first_air_date.slice(0, 4) : '';
  const genrePart: string = details.genres[0]?.name ?? '';
  return joinYearAndGenre(year, genrePart);
}
