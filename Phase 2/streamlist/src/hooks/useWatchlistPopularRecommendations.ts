import { useCallback, useEffect, useState } from 'react';
import { fetchMovieGenres, fetchTrendingMoviesWeek } from '../api/movies';
import type { Genre, MovieListItem } from '../api/types';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind, UseQueryResult } from './types';

export interface WatchlistPopularRecommendationsData {
  movies: MovieListItem[];
  genres: Genre[];
}

/**
 * Loads trending movies (week) and genres for Popular Recommendations on the empty watchlist screen.
 * When `enabled` is false, skips network work (e.g. when the watchlist has saved titles).
 */
export function useWatchlistPopularRecommendations(
  enabled: boolean = true,
): UseQueryResult<WatchlistPopularRecommendationsData> {
  const [data, setData] = useState<WatchlistPopularRecommendationsData | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const load = useCallback(async (): Promise<void> => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const [moviesPage, genresResponse] = await Promise.all([
        fetchTrendingMoviesWeek(1),
        fetchMovieGenres(),
      ]);
      setData({ movies: moviesPage.results, genres: genresResponse.genres });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      setErrorKind(null);
      return;
    }
    load().catch(() => undefined);
  }, [enabled, load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { data, loading, error, errorKind, refetch };
}
