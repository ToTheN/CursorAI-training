import type { Genre, MovieListItem } from '../api/types';

/**
 * Builds `year • first genre` for content cards (carousel / grid).
 */
export function buildMovieCardSubtitle(item: MovieListItem, allGenres: Genre[]): string {
  const year: string =
    item.release_date.length >= 4 ? item.release_date.slice(0, 4) : '';
  const genreNames: string[] = item.genre_ids
    .map((id: number) => allGenres.find((g: Genre) => g.id === id)?.name)
    .filter((name: string | undefined): name is string => name !== undefined);
  const genrePart: string = genreNames[0] ?? '';
  if (year.length > 0 && genrePart.length > 0) {
    return `${year} • ${genrePart}`;
  }
  if (year.length > 0) {
    return year;
  }
  if (genrePart.length > 0) {
    return genrePart;
  }
  return '';
}
