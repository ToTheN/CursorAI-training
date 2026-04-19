/**
 * TMDB-oriented API response shapes.
 */
export interface Genre {
  id: number;
  name: string;
}

export interface MovieListItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface GenreListResponse {
  genres: Genre[];
}

export interface MovieDetails {
  title: string;
  backdrop_path: string | null;
  /** Used when backdrop is missing (hero fallback). */
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genres: Genre[];
  runtime: number | null;
  overview: string;
}

export interface CastMember {
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
}

/** TMDB `/movie/{id}/similar` rows match discover list items. */
export type SimilarMovieItem = MovieListItem;

/** TMDB `/tv/{id}` detail subset used by the watchlist. */
export interface TvDetails {
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genres: Genre[];
  overview: string;
}

/** TMDB TV list row (discover / similar). */
export interface TvListItem {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
}
