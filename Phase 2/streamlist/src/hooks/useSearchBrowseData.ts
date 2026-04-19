import { useCallback, useEffect, useState } from 'react';
import { fetchMovieDetails, fetchMovieGenres, fetchTrendingMoviesWeek } from '../api/movies';
import type {
  Genre,
  GenreListResponse,
  MovieDetails,
  MovieListItem,
  PaginatedResponse,
} from '../api/types';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind } from './types';

export interface UseSearchBrowseDataResult {
  genres: Genre[];
  trending: MovieListItem[];
  featuredRuntimeMinutes: number | null;
  loading: boolean;
  error: string | null;
  errorKind: QueryErrorKind | null;
  refetch: () => void;
}

export function useSearchBrowseData(): UseSearchBrowseDataResult {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [trending, setTrending] = useState<MovieListItem[]>([]);
  const [featuredRuntimeMinutes, setFeaturedRuntimeMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const settled: [
        PromiseSettledResult<PaginatedResponse<MovieListItem>>,
        PromiseSettledResult<GenreListResponse>,
      ] = await Promise.allSettled([fetchTrendingMoviesWeek(1), fetchMovieGenres()]);
      const trendingSettled: PromiseSettledResult<PaginatedResponse<MovieListItem>> = settled[0];
      const genresSettled: PromiseSettledResult<GenreListResponse> = settled[1];
      const trendingResult: PaginatedResponse<MovieListItem> =
        trendingSettled.status === 'fulfilled'
          ? trendingSettled.value
          : { page: 1, results: [], total_pages: 0, total_results: 0 };
      const genreList: Genre[] =
        genresSettled.status === 'fulfilled' ? genresSettled.value.genres : [];
      setTrending(trendingResult.results);
      setGenres(genreList);
      if (trendingSettled.status === 'rejected') {
        setError(errorMessageFromUnknown(trendingSettled.reason));
        setErrorKind(queryErrorKindFromUnknown(trendingSettled.reason));
      } else if (genresSettled.status === 'rejected') {
        setError(errorMessageFromUnknown(genresSettled.reason));
        setErrorKind(queryErrorKindFromUnknown(genresSettled.reason));
      } else {
        setError(null);
        setErrorKind(null);
      }
      const first: MovieListItem | undefined = trendingResult.results[0];
      if (first !== undefined) {
        try {
          const details: MovieDetails = await fetchMovieDetails(first.id);
          setFeaturedRuntimeMinutes(details.runtime);
        } catch {
          setFeaturedRuntimeMinutes(null);
        }
      } else {
        setFeaturedRuntimeMinutes(null);
      }
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setTrending([]);
      setGenres([]);
      setFeaturedRuntimeMinutes(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect((): void => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { genres, trending, featuredRuntimeMinutes, loading, error, errorKind, refetch };
}
