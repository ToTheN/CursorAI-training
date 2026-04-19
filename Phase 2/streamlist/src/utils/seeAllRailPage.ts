import {
  fetchDiscoverMovies,
  fetchSimilarMovies,
  fetchSimilarTvShows,
  fetchTopRatedMovies,
  fetchTrendingMoviesWeek,
} from '../api/movies';
import type { MovieListItem, PaginatedResponse, TvListItem } from '../api/types';
import type { SeeAllRail } from '../navigation/types';
import { tvListItemToMovieListItem } from './tmdbListAdapters';

/**
 * Paginated movie fetch for See All — same TMDB endpoints as the matching Home horizontal rail:
 * - `trending` → `/trending/movie/week`
 * - `topRated` → `/movie/top_rated`
 * - `discover` → `/discover/movie` with optional `with_genres`
 * - `similar` → `/movie/{id}/similar` or `/tv/{id}/similar`
 */
export function fetchSeeAllRailPage(
  rail: SeeAllRail,
  page: number,
  discoverWithGenres: number | string | undefined,
  similarSourceMovieId: number | undefined,
  similarSourceTvId: number | undefined,
): Promise<PaginatedResponse<MovieListItem>> {
  if (rail === 'similar') {
    if (similarSourceMovieId !== undefined) {
      return fetchSimilarMovies(similarSourceMovieId, page);
    }
    if (similarSourceTvId !== undefined) {
      return fetchSimilarTvShows(similarSourceTvId, page).then(
        (response: PaginatedResponse<TvListItem>): PaginatedResponse<MovieListItem> => ({
          page: response.page,
          total_pages: response.total_pages,
          total_results: response.total_results,
          results: response.results.map(tvListItemToMovieListItem),
        }),
      );
    }
    return Promise.reject(new Error('similar rail requires a movie or TV source id'));
  }
  if (rail === 'trending') {
    return fetchTrendingMoviesWeek(page);
  }
  if (rail === 'topRated') {
    return fetchTopRatedMovies(page);
  }
  return fetchDiscoverMovies(discoverWithGenres, page);
}
