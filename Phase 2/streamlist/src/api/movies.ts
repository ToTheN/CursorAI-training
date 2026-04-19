import { apiClient } from './client';
import type {
  GenreListResponse,
  MovieCredits,
  MovieDetails,
  MovieListItem,
  PaginatedResponse,
  TvDetails,
  TvListItem,
} from './types';

const DEFAULT_PAGE: number = 1;

export async function fetchTrendingMoviesWeek(
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/trending/movie/week', {
    params: { page },
  });
  return response.data;
}

export async function fetchTopRatedMovies(
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/movie/top_rated', {
    params: { page },
  });
  return response.data;
}

export async function fetchMovieGenres(): Promise<GenreListResponse> {
  const response = await apiClient.get<GenreListResponse>('/genre/movie/list');
  return response.data;
}

/**
 * TMDB `/discover/movie` `with_genres`: commas mean AND, pipes mean OR.
 * A single id is sent as a number; multiple ids for "all genres" must use `|` (OR),
 * otherwise comma-joined ids would require every genre at once and return no useful rows.
 * Omit `withGenres` (or pass `undefined`) to call discover without a genre filter.
 */
export async function fetchDiscoverMovies(
  withGenres: number | string | undefined,
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<MovieListItem>> {
  const params: { page: number; with_genres?: number | string } = { page };
  if (withGenres !== undefined && withGenres !== '') {
    params.with_genres = withGenres;
  }
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/discover/movie', {
    params,
  });
  return response.data;
}

/** Builds `with_genres` for "every genre from /genre/movie/list" using OR semantics. */
export function buildWithGenresOrParam(genres: ReadonlyArray<{ id: number }>): string {
  return genres.map((g) => g.id).join('|');
}

export async function searchMovies(
  query: string,
  page: number = DEFAULT_PAGE,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/search/movie', {
    params: { query, page },
    ...(signal !== undefined ? { signal } : {}),
  });
  return response.data;
}

export async function fetchMovieDetails(movieId: number): Promise<MovieDetails> {
  const response = await apiClient.get<MovieDetails>(`/movie/${movieId}`);
  return response.data;
}

export async function fetchMovieCredits(movieId: number): Promise<MovieCredits> {
  const response = await apiClient.get<MovieCredits>(`/movie/${movieId}/credits`);
  return response.data;
}

export async function fetchSimilarMovies(
  movieId: number,
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>(
    `/movie/${movieId}/similar`,
    { params: { page } },
  );
  return response.data;
}

export async function fetchTvDetails(tvId: number): Promise<TvDetails> {
  const response = await apiClient.get<TvDetails>(`/tv/${tvId}`);
  return response.data;
}

export async function fetchSimilarTvShows(
  tvId: number,
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<TvListItem>> {
  const response = await apiClient.get<PaginatedResponse<TvListItem>>(`/tv/${tvId}/similar`, {
    params: { page },
  });
  return response.data;
}
