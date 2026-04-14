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

export interface SimilarMovieItem {
  id: number;
  title: string;
  poster_path: string | null;
}
