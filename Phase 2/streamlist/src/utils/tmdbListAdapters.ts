import type { MovieListItem, TvListItem } from '../api/types';

/**
 * Maps a TMDB TV list row to {@link MovieListItem} so shared card / See All paths can render TV rows.
 */
export function tvListItemToMovieListItem(item: TvListItem): MovieListItem {
  return {
    id: item.id,
    title: item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    release_date: item.first_air_date,
    genre_ids: item.genre_ids,
  };
}
