import {
  fetchDiscoverMovies,
  fetchTopRatedMovies,
  fetchTrendingMoviesWeek,
} from '../api/movies';
import type { MovieListItem, PaginatedResponse } from '../api/types';
import type { SeeAllRail } from '../navigation/types';

/**
 * Paginated movie fetch for See All — same TMDB endpoints as the matching Home horizontal rail:
 * - `trending` → `/trending/movie/week`
 * - `topRated` → `/movie/top_rated`
 * - `discover` → `/discover/movie` with optional `with_genres`
 */
export function fetchSeeAllRailPage(
  rail: SeeAllRail,
  page: number,
  discoverWithGenres: number | string | undefined,
): Promise<PaginatedResponse<MovieListItem>> {
  if (rail === 'trending') {
    return fetchTrendingMoviesWeek(page);
  }
  if (rail === 'topRated') {
    return fetchTopRatedMovies(page);
  }
  return fetchDiscoverMovies(discoverWithGenres, page);
}
